PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bots` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`user_id` integer NOT NULL,
	`picture` blob,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_bots`("id", "name", "description", "created_at", "user_id", "picture") SELECT "id", "name", "description", "created_at", "user_id", "picture" FROM `bots`;--> statement-breakpoint
DROP TABLE `bots`;--> statement-breakpoint
ALTER TABLE `__new_bots` RENAME TO `bots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;