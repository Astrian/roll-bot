/// <reference types="./Participants.d.ts" />

type Tier = {
  id: string,
  name: string,
  number: number,
  prize: string,
  winners?: Participant[]
}