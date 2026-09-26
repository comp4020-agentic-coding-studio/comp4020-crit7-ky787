CREATE TABLE `assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`item_id` text NOT NULL,
	`label` text NOT NULL,
	`title` text NOT NULL,
	`due_at` text NOT NULL,
	`weight` integer NOT NULL,
	`max_score` real NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assessments_course_idx` ON `assessments` (`course_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`term_label` text NOT NULL,
	`term_start` text NOT NULL,
	`teaching_weeks` integer NOT NULL,
	`break_after_week` integer DEFAULT 0 NOT NULL,
	`break_weeks` integer DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`section_id` text,
	`slug` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`external_url` text,
	`position` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT 1 NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `items_course_idx` ON `items` (`course_id`);--> statement-breakpoint
CREATE INDEX `items_section_idx` ON `items` (`section_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `items_course_slug` ON `items` (`course_id`,`slug`);--> statement-breakpoint
CREATE TABLE `results` (
	`assessment_id` text PRIMARY KEY NOT NULL,
	`score` real NOT NULL,
	`feedback` text NOT NULL,
	`marker_note` text DEFAULT '' NOT NULL,
	`released` integer DEFAULT 0 NOT NULL,
	`released_at` text,
	FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saves` (
	`visitor_id` text NOT NULL,
	`item_id` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`visitor_id`, `item_id`),
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`week` integer,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sections_course_idx` ON `sections` (`course_id`);--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`last_seen_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`visitor_id` text NOT NULL,
	`item_id` text NOT NULL,
	`visited_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`visitor_id`, `item_id`),
	FOREIGN KEY (`visitor_id`) REFERENCES `visitors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
