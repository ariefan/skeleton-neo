import { pgTable, varchar, timestamp, serial, json, text } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  publishedAt: timestamp("published_at"),

  // Single Uploads
  coverImage: varchar("cover_image", { length: 512 }),
  attachmentFile: varchar("attachment_file", { length: 512 }),

  // Multiple Uploads (using JSON for storage)
  galleryImages: json("gallery_images").$type<string[]>(),
  additionalDocuments: json("additional_documents").$type<string[]>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
