"use server"

import { prisma } from "@/lib/prisma"
import { syncCampaigns } from "@/lib/google-ads"
import { revalidatePath } from "next/cache"

export async function syncAds() {
  const result = await syncCampaigns(30)
  revalidatePath("/ads")
  return result
}

export async function disconnectAds() {
  await prisma.oAuthToken.deleteMany({ where: { provider: "google-ads" } })
  revalidatePath("/ads")
}
