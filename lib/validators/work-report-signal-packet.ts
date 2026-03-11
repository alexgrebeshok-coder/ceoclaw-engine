import { z } from "zod";

export const workReportSignalPacketSchema = z
  .object({
    locale: z.enum(["ru", "en", "zh"]).optional(),
    interfaceLocale: z.enum(["ru", "en", "zh"]).optional(),
  })
  .strict();
