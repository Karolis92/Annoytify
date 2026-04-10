CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`date` integer NOT NULL,
	`repeat` text DEFAULT 'NO' NOT NULL,
	`done` integer DEFAULT false NOT NULL
);
