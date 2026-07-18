import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const presentations = sqliteTable("presentations", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  visibility: text("visibility").notNull().default("public"),
  passwordHash: text("password_hash"),
  currentSlide: integer("current_slide").notNull().default(1),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  displayName: text("display_name").notNull(),
  provider: text("provider").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("users_provider_email_idx").on(table.provider, table.email),
]);

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const magicLinks = sqliteTable("magic_links", {
  tokenHash: text("token_hash").primaryKey(),
  email: text("email").notNull(),
  marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
  expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  presentationSlug: text("presentation_slug").notNull().default("build-week"),
  slideId: text("slide_id").notNull(),
  userId: text("user_id").references(() => users.id),
  guestName: text("guest_name"),
  body: text("body").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  provider: text("provider"),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("comments_slide_idx").on(table.presentationSlug, table.slideId, table.visible, table.createdAt),
]);

export const reactions = sqliteTable("reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  presentationSlug: text("presentation_slug").notNull().default("build-week"),
  slideId: text("slide_id").notNull(),
  userId: text("user_id").references(() => users.id),
  visitorId: text("visitor_id").notNull(),
  stamp: text("stamp").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("reactions_slide_idx").on(table.presentationSlug, table.slideId, table.stamp),
]);

export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  segment: text("segment").notNull().default("all_opted_in"),
  status: text("status").notNull().default("draft"),
  sentCount: integer("sent_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  sentAt: text("sent_at"),
});
