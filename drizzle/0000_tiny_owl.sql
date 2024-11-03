CREATE TABLE `multiple_choice_options` (
	`id` integer PRIMARY KEY NOT NULL,
	`question_id` integer,
	`option_text` text,
	`is_correct` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY NOT NULL,
	`question` text,
	`question_type` text,
	`quiz_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`question_count` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`status` text,
	`source_id` integer,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
