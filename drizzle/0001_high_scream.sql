PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mutexes` (
	`resource` text PRIMARY KEY NOT NULL,
	`nonce` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_mutexes`("resource", "nonce", "expires_at") SELECT "resource", "nonce", "expires_at" FROM `mutexes`;--> statement-breakpoint
DROP TABLE `mutexes`;--> statement-breakpoint
ALTER TABLE `__new_mutexes` RENAME TO `mutexes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;