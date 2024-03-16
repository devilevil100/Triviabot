import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { GameManager } from 'discord-trivia';
import {EmbedBuilder} from 'discord.js';
import { MultipleChoiceQuestion, BooleanQuestion,DefaultEmbeds } from 'discord-trivia';
const manager = new GameManager();
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const db = await open({
  filename: './mydatabase.db', // Specify the database file
  driver: sqlite3.Database,
});
export class TestCommand implements Command {
    public names = [Lang.getRef('chatCommands.test', Language.Default)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.NONE;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        const game = manager.createGame(intr.channel);
		
		const customQuestions = [
		 
		  // Add more custom questions here...
		];
		var data2 = db.all('SELECT * FROM questions ORDER BY RANDOM() LIMIT 18');
		data2.then(user => {
		user.forEach(function (row) {
		const myArray = row.answer.split(", ");
		
		var correct = []
		var mcqs = []
		
		myArray.forEach(function (item, index) {
		  if (item.startsWith("✅") ){ 
			  correct.push(item);
		  }
		  else {
			  mcqs.push(item);
		   }
		  });
		customQuestions.push(
		new MultipleChoiceQuestion()
    .setValue(row.question)
    .setCategory("NFL")
    .setDifficulty('medium')
	.setImage(row.image)
    .setCorrectAnswer(correct[0].replace("✅",""))
    .setIncorrectAnswers([mcqs[0],mcqs[1], mcqs[2]])
)

		
		});
		
    });
	
	game.config.customQuestions = customQuestions;
	game.config.messageDeleter.queue = 20_000;
game.config.messageDeleter.gameStart = 10_000;
game.config.timePerQuestion = 25_000;  // 15 seconds
	game.config.messageDeleter.leaderboardUpdate = 5_000;

	game.config.embeds.gameEnd = () => {
    return DefaultEmbeds.finalLeaderboard(game)
}
game.config.embeds.queue = player => {
    return new EmbedBuilder()
  .setAuthor({
    name: "Trivia starting...",
  })
  .setTitle("Are you ready?")
  .setDescription("R&G presents… NFL Combine,  40 Yard Dash Trivia!! To help you get familiarized with all the new program players! How well do you know everyone on the list? Test your knowledge. 🙂")
  .setImage("https://media.discordapp.net/attachments/1218283695551676488/1218496141243715725/2.png?ex=6607dff6&is=65f56af6&hm=4167c273eff56d36ae16c011308b1523aee9164638236d84fd6c86fb48288e5f&=&format=webp&quality=lossless&width=389&height=389")
  .setColor("#d6fe4c");
}

	game.config.fetchQuestionsOptions = {
    amount: 0,
    category: 'Sports',
    difficulty: 'medium',
    type: 'multiple'
}
	await game.startQueue(intr);
};
}