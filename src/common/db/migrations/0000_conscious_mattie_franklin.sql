CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`date` text NOT NULL,
	`repeat` text NOT NULL,
	`done` integer DEFAULT false NOT NULL
);
