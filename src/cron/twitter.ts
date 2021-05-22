import { CronJob } from 'cron';
import axios from 'axios';
import dayjs from 'dayjs';
import { messages } from '@config';
import { client } from 'client';
import { TextChannel } from 'discord.js';

interface Tweet {
  id: string;
  text: string;
}

interface TweetResponse {
  data?: Tweet[];
}

async function checkTwitter(): Promise<void> {
  try {
    const currentTime = dayjs();

    const { data } = await axios.get<TweetResponse>(
      'https://api.twitter.com/2/users/377244791/tweets',
      {
        headers: {
          authorization: `Bearer ${process.env.TWITTER_TOKEN ?? ''}`,
        },
        params: {
          max_results: 5,
          exclude: 'retweets,replies',
          start_time: currentTime.subtract(15, 'minute').toISOString(),
          end_time: currentTime.toISOString(),
        },
      },
    );

    const devFeedChannelId = messages.devfeed;
    const channel = client.channels.cache.get(devFeedChannelId) as TextChannel;

    const tweets = data.data;
    if (tweets === undefined) return; 

    for (const tweet of tweets) {
      if (tweet.text.includes('#paimonmoe')) {
        await channel.send(
          `<@&835796963492364288> https://twitter.com/MadeBaruna/status/${tweet.id}`,
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export function startTwitterCron(): void {
  const twitterJob = new CronJob('*/10 * * * *', () => {
    void checkTwitter();
  });
  twitterJob.start();
}
