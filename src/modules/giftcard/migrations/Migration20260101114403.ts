import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260101114403 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "gift_card" drop constraint if exists "gift_card_code_unique";`);
    this.addSql(`create table if not exists "gift_card" ("id" text not null, "code" text not null, "initial_value" numeric not null, "balance" numeric not null, "currency_code" text not null, "purchaser_id" text null, "purchaser_email" text null, "order_id" text null, "recipient_email" text not null, "recipient_name" text null, "message" text null, "status" text check ("status" in ('active', 'used', 'expired', 'cancelled')) not null default 'active', "used_count" integer not null default 0, "purchased_at" timestamptz null, "sent_at" timestamptz null, "first_used_at" timestamptz null, "expires_at" timestamptz null, "metadata" jsonb null, "raw_initial_value" jsonb not null, "raw_balance" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gift_card_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_gift_card_code_unique" ON "gift_card" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gift_card_deleted_at" ON "gift_card" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "gift_card_transaction" ("id" text not null, "gift_card_id" text not null, "gift_card_code" text not null, "type" text check ("type" in ('purchase', 'redemption', 'refund', 'cancellation')) not null, "amount" numeric not null, "balance_after" numeric not null, "currency_code" text not null, "order_id" text null, "cart_id" text null, "customer_id" text null, "metadata" jsonb null, "raw_amount" jsonb not null, "raw_balance_after" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gift_card_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gift_card_transaction_deleted_at" ON "gift_card_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "gift_card" cascade;`);

    this.addSql(`drop table if exists "gift_card_transaction" cascade;`);
  }

}
