/// <reference types="./Tier.d.ts" />

type RafflePool = {
  id: string,
  participants: Participant[],
  participants_number: number,
  tiers: Tier[],
  name: string,
  has_raffled: boolean
}