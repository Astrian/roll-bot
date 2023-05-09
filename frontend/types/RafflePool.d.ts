declare type RafflePool = {
  raffle_poll_id: string,
  participants: Participant[],
  participants_number: number,
  tiers: Tier[],
  name: string,
  has_raffled: boolean
}