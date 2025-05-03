## API Documentation

All API requests require an API key sent via the `x-api` header. This key is used to identify the user making the request.

### Authentication

All requests must include the API key in the `x-api` header:

```js
const headers = {
  "Content-Type": "application/json",
  "x-api": "your-api-key-here",
};
```

### Endpoints

#### 1. Create a Bot

Creates a new bot with a name, description, and auto-generated profile picture.

- **URL**: `/bots`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "My Bot",
    "description": "This is a friendly and helpful assistant."
  }
  ```

**Example:**

```javascript
const response = await fetch("https://bots.konic.worker.dev/bots", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api": "your-api-key-here",
  },
  body: JSON.stringify({
    name: "Customer Support Bot",
    description: "A helpful bot that assists customers with their inquiries.",
  }),
});

const data = await response.json();
// Response: { "message": "Bot created!" }
```

#### 2. List All Bots

Retrieves all bots created by the authenticated user.

- **URL**: `/bots`
- **Method**: `GET`

**Example:**

```javascript
const response = await fetch("https://bots.konic.worker.dev/bots", {
  headers: {
    "x-api": "your-api-key-here",
  },
});

const data = await response.json();
/* Response:
{
  "bots": [
    {
      "id": 1,
      "name": "Customer Support Bot",
      "description": "A helpful bot that assists customers with their inquiries.",
      "createdAt": "2023-06-15T10:30:00Z",
      "userId": 1,
      "picture": "base64-encoded-image-data"
    },
    // more bots...
  ]
}
*/
```

#### 3. Get Bot Details

Retrieves details about a specific bot, including its conversation history.

- **URL**: `/bots/:id`
- **Method**: `GET`
- **URL Parameters**: `id` - The ID of the bot

**Example:**

```javascript
const botId = 1;
const response = await fetch(`https://bots.konic.worker.dev/bots/${botId}`, {
  headers: {
    "x-api": "your-api-key-here",
  },
});

const data = await response.json();
/* Response:
{
  "bot": {
    "id": 1,
    "name": "Customer Support Bot",
    "description": "A helpful bot that assists customers with their inquiries.",
    "userId": 1,
    "createdAt": "2023-06-15T10:30:00Z"
  }
}
*/
```

#### 4. Get Bot Profile Picture

Retrieves the profile picture of a specific bot.

- **URL**: `/bots/:id/picture`
- **Method**: `GET`
- **URL Parameters**: `id` - The ID of the bot
- **Query Parameters**: `apiKey` - Your API key for authentication
- **Response**: PNG image

**Example:**

```javascript
const botId = 1;
const apiKey = "your-api-key-here";
const response = await fetch(
  `https://bots.konic.worker.dev/bots/${botId}/picture?apiKey=${apiKey}`
);

// Response will be a PNG image that can be displayed directly in an <img> tag
const imageBlob = await response.blob();
const imageUrl = URL.createObjectURL(imageBlob);
// Use imageUrl in an <img> element
```

#### 5. Send Message to Bot

Sends a message to a bot and receives a response.

- **URL**: `/bots/:id/messages`
- **Method**: `POST`
- **URL Parameters**: `id` - The ID of the bot
- **Body**:
  ```json
  {
    "message": "Your message here"
  }
  ```

**Example:**

```javascript
const botId = 1;
const response = await fetch(
  `https://bots.konic.worker.dev/bots/${botId}/messages`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api": "your-api-key-here",
    },
    body: JSON.stringify({
      message: "What services do you offer?",
    }),
  }
);

const data = await response.json();
/* Response:
{
  "message": "We offer a variety of services including customer support, product recommendations, and general assistance. How can I help you specifically today?"
}
*/
```

#### 6. Get Messages of a Bot

Sends a message to a bot and receives a response.

- **URL**: `/bots/:id/messages`
- **Method**: `GET`

**Example:**

```javascript
const botId = 1;
const response = await fetch(
  `https://bots.konic.worker.dev/bots/${botId}/messages`,
  {
    headers: {
      "Content-Type": "application/json",
      "x-api": "your-api-key-here",
    },
  }
);

const data = await response.json();
/* Response:
{
  "messages": [
    {
      "id": 1,
      "content": "Hey there, how are you?",
      "createdAt": null,
      "botId": 2,
      "role": "user"
    },
    {
      "id": 2,
      "content": "Well, considering I'm a genius billionaire playboy philanthropist with a penchant for saving the world in a custom-built red and gold suit... I'd say I'm doing just fine. How about you? Need something built, hacked, or blown up—in that order?",
      "createdAt": null,
      "botId": 2,
      "role": "assistant"
    }
  ]
}
*/
```
