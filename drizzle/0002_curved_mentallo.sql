CREATE TABLE `branch_votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`presentation_slug` text DEFAULT 'build-week' NOT NULL,
	`slide_id` text NOT NULL,
	`option_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`user_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `branch_votes_visitor_idx` ON `branch_votes` (`presentation_slug`,`slide_id`,`visitor_id`);--> statement-breakpoint
CREATE INDEX `branch_votes_option_idx` ON `branch_votes` (`presentation_slug`,`slide_id`,`option_id`);