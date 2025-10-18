import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import type { Response } from "express";
import {
  getAllProvinces,
  getProvinceById,
  createProvince,
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  verifyAddress,
  getBuildingsByAddressId,
  createBuilding,
  getPhotosByAddressId,
  createPhoto,
  createSurveySession,
  getActiveSurveySession,
  updateSurveySession,
  getAddressStatsByProvince,
  getDataSourceStats,
  getDashboardStats,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Type assertion needed because tRPC's type doesn't expose Express methods
      const expressRes = ctx.res as any;
      expressRes.cookie(COOKIE_NAME, "", { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Province management
  provinces: router({
    list: publicProcedure.query(async () => {
      return await getAllProvinces();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getProvinceById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string(),
          code: z.string(),
          population: z.number().optional(),
          areaSqkm: z.string().optional(),
          capitalCity: z.string().optional(),
          targetAddresses: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createProvince(input);
      }),
  }),

  // Address management
  addresses: router({
    list: publicProcedure
      .input(
        z
          .object({
            provinceId: z.string().optional(),
            verificationStatus: z.string().optional(),
            dataSource: z.string().optional(),
            search: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await getAllAddresses(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await getAddressById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          fullAddress: z.string(),
          zone: z.string().optional(),
          street: z.string().optional(),
          doorNumber: z.string().optional(),
          quartier: z.string().optional(),
          commune: z.string().optional(),
          provinceId: z.string().optional(),
          latitude: z.string().optional(),
          longitude: z.string().optional(),
          emergencyContacts: z.any().optional(),
          serviceIcons: z.any().optional(),
          dataSource: z.enum(["ai_detected", "manual_survey", "crowdsourced", "imported"]).optional(),
          confidenceScore: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createAddress({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          updates: z.object({
            fullAddress: z.string().optional(),
            zone: z.string().optional(),
            street: z.string().optional(),
            doorNumber: z.string().optional(),
            quartier: z.string().optional(),
            commune: z.string().optional(),
            latitude: z.string().optional(),
            longitude: z.string().optional(),
            emergencyContacts: z.any().optional(),
            serviceIcons: z.any().optional(),
            verificationStatus: z.enum(["unverified", "pending", "verified", "disputed"]).optional(),
          }),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await updateAddress(input.id, input.updates, ctx.user.id);
      }),

    verify: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await verifyAddress(input.id, ctx.user.id);
      }),
  }),

  // Building management
  buildings: router({
    getByAddressId: publicProcedure
      .input(z.object({ addressId: z.string() }))
      .query(async ({ input }) => {
        return await getBuildingsByAddressId(input.addressId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          addressId: z.string().optional(),
          detectionMethod: z.enum(["ai", "manual", "satellite", "survey"]).optional(),
          confidenceScore: z.string().optional(),
          buildingType: z.string().optional(),
          floorCount: z.number().optional(),
          roofMaterial: z.string().optional(),
          polygonData: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createBuilding(input);
      }),
  }),

  // Photo management
  photos: router({
    getByAddressId: publicProcedure
      .input(z.object({ addressId: z.string() }))
      .query(async ({ input }) => {
        return await getPhotosByAddressId(input.addressId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          addressId: z.string(),
          url: z.string(),
          type: z.enum(["street_sign", "building", "context", "survey"]).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createPhoto({
          ...input,
          uploadedBy: ctx.user.id,
        });
      }),
  }),

  // Survey sessions
  survey: router({
    startSession: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          provinceId: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createSurveySession({
          ...input,
          surveyorId: ctx.user.id,
        });
      }),

    getActiveSession: protectedProcedure.query(async ({ ctx }) => {
      return await getActiveSurveySession(ctx.user.id);
    }),

    endSession: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return await updateSurveySession(input.id, {
          status: "completed",
          endedAt: new Date(),
        });
      }),
  }),

  // Analytics and statistics
  analytics: router({
    dashboard: publicProcedure.query(async () => {
      return await getDashboardStats();
    }),

    byProvince: publicProcedure.query(async () => {
      return await getAddressStatsByProvince();
    }),

    byDataSource: publicProcedure.query(async () => {
      return await getDataSourceStats();
    }),
  }),

  // Admin operations
  admin: router({
    seedDatabase: adminProcedure.mutation(async () => {
      const { seedDatabase } = await import("./admin/seedDatabase");
      return await seedDatabase();
    }),
  }),
});

export type AppRouter = typeof appRouter;

