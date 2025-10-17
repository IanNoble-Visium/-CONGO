import { eq, desc, and, or, like, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  provinces,
  communes,
  quartiers,
  addresses,
  buildings,
  photos,
  surveySessions,
  aiProcessingJobs,
  changeLog,
  type Province,
  type Address,
  type Building,
  type Photo,
  type SurveySession,
  type InsertProvince,
  type InsertAddress,
  type InsertBuilding,
  type InsertPhoto,
  type InsertSurveySession,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.id,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== Province Functions ==========

export async function getAllProvinces() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(provinces).orderBy(provinces.name);
}

export async function getProvinceById(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(provinces).where(eq(provinces.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProvince(province: InsertProvince) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(provinces).values(province);
  return province;
}

export async function updateProvinceMappingProgress(provinceId: string) {
  const db = await getDb();
  if (!db) return;

  // Calculate progress based on completed vs target addresses
  const [stats] = await db
    .select({
      completed: count(addresses.id),
    })
    .from(addresses)
    .where(eq(addresses.provinceId, provinceId));

  const province = await getProvinceById(provinceId);
  if (!province || !province.targetAddresses) return;

  const progress = (stats.completed / province.targetAddresses) * 100;

  await db
    .update(provinces)
    .set({
      completedAddresses: stats.completed,
      mappingProgress: progress.toFixed(2),
    })
    .where(eq(provinces.id, provinceId));
}

// ========== Address Functions ==========

export async function getAllAddresses(filters?: {
  provinceId?: string;
  verificationStatus?: string;
  dataSource?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { addresses: [], total: 0 };

  let query = db.select().from(addresses).$dynamic();
  let countQuery = db.select({ count: count() }).from(addresses).$dynamic();

  const conditions = [];

  if (filters?.provinceId) {
    conditions.push(eq(addresses.provinceId, filters.provinceId));
  }

  if (filters?.verificationStatus) {
    conditions.push(eq(addresses.verificationStatus, filters.verificationStatus as any));
  }

  if (filters?.dataSource) {
    conditions.push(eq(addresses.dataSource, filters.dataSource as any));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(addresses.fullAddress, `%${filters.search}%`),
        like(addresses.street, `%${filters.search}%`),
        like(addresses.quartier, `%${filters.search}%`)
      )!
    );
  }

  if (conditions.length > 0) {
    const condition = and(...conditions)!;
    query = query.where(condition);
    countQuery = countQuery.where(condition);
  }

  query = query.orderBy(desc(addresses.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  const [addressList, totalResult] = await Promise.all([query, countQuery]);

  return {
    addresses: addressList,
    total: totalResult[0]?.count || 0,
  };
}

export async function getAddressById(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAddress(address: InsertAddress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(addresses).values(address);

  // Update province progress
  if (address.provinceId) {
    await updateProvinceMappingProgress(address.provinceId);
  }

  return address;
}

export async function updateAddress(id: string, updates: Partial<InsertAddress>, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const oldAddress = await getAddressById(id);
  if (!oldAddress) throw new Error("Address not found");

  await db.update(addresses).set(updates).where(eq(addresses.id, id));

  // Log changes
  for (const [field, newValue] of Object.entries(updates)) {
    const oldValue = oldAddress[field as keyof Address];
    if (oldValue !== newValue) {
      await db.insert(changeLog).values({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addressId: id,
        fieldChanged: field,
        oldValue: String(oldValue),
        newValue: String(newValue),
        changedBy: userId,
      });
    }
  }

  return await getAddressById(id);
}

export async function verifyAddress(id: string, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(addresses)
    .set({
      verificationStatus: "verified",
      verifiedBy: userId,
      verifiedAt: new Date(),
    })
    .where(eq(addresses.id, id));

  return await getAddressById(id);
}

// ========== Building Functions ==========

export async function getBuildingsByAddressId(addressId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(buildings).where(eq(buildings.addressId, addressId));
}

export async function createBuilding(building: InsertBuilding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(buildings).values(building);
  return building;
}

// ========== Photo Functions ==========

export async function getPhotosByAddressId(addressId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(photos).where(eq(photos.addressId, addressId));
}

export async function createPhoto(photo: InsertPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(photos).values(photo);
  return photo;
}

// ========== Survey Session Functions ==========

export async function createSurveySession(session: InsertSurveySession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(surveySessions).values(session);
  return session;
}

export async function getActiveSurveySession(surveyorId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(surveySessions)
    .where(and(eq(surveySessions.surveyorId, surveyorId), eq(surveySessions.status, "active")))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateSurveySession(id: string, updates: Partial<InsertSurveySession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(surveySessions).set(updates).where(eq(surveySessions.id, id));
}

// ========== Analytics Functions ==========

export async function getAddressStatsByProvince() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      provinceId: addresses.provinceId,
      provinceName: provinces.name,
      total: count(addresses.id),
      verified: sql<number>`SUM(CASE WHEN ${addresses.verificationStatus} = 'verified' THEN 1 ELSE 0 END)`,
      unverified: sql<number>`SUM(CASE WHEN ${addresses.verificationStatus} = 'unverified' THEN 1 ELSE 0 END)`,
      pending: sql<number>`SUM(CASE WHEN ${addresses.verificationStatus} = 'pending' THEN 1 ELSE 0 END)`,
    })
    .from(addresses)
    .leftJoin(provinces, eq(addresses.provinceId, provinces.id))
    .groupBy(addresses.provinceId, provinces.name);
}

export async function getDataSourceStats() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      dataSource: addresses.dataSource,
      count: count(addresses.id),
    })
    .from(addresses)
    .groupBy(addresses.dataSource);
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db)
    return {
      totalAddresses: 0,
      verifiedAddresses: 0,
      totalProvinces: 0,
      activeSurveyors: 0,
    };

  const [addressStats, provinceCount, surveyorCount] = await Promise.all([
    db
      .select({
        total: count(addresses.id),
        verified: sql<number>`SUM(CASE WHEN ${addresses.verificationStatus} = 'verified' THEN 1 ELSE 0 END)`,
      })
      .from(addresses),
    db.select({ count: count() }).from(provinces),
    db
      .select({ count: count() })
      .from(surveySessions)
      .where(eq(surveySessions.status, "active")),
  ]);

  return {
    totalAddresses: addressStats[0]?.total || 0,
    verifiedAddresses: addressStats[0]?.verified || 0,
    totalProvinces: provinceCount[0]?.count || 0,
    activeSurveyors: surveyorCount[0]?.count || 0,
  };
}

