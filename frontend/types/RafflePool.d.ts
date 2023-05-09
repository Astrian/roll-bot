/// <reference types="./Tier.d.ts" />
/// <reference types="./Participants.d.ts" />

type RafflePool = {
  raffle_poll_id: string,
  participants: Participant[],
  participants_number: number,
  tiers: Tier[],
  name: string,
  has_raffled: boolean
}