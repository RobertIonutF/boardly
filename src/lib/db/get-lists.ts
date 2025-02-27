import type { Card, List, User, Label, Comment } from "@prisma/client";

export interface CardWithRelations extends Card {
  labels?: Label[];
  assignee?: User | null;
  comments?: Comment[];
}

export interface ListWithCards extends List {
  cards: CardWithRelations[];
} 