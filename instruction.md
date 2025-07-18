



### In memory cache(cache-manager) vs redis cache

| Feature                 | In-Memory Cache      | Redis Cache  |   |   |   |   |   |   |   |
|-------------------------|----------------------|--------------|---|---|---|---|---|---|---|
| Speed                   | ⚡ Fastest            | 🚀 Very fast |   |   |   |   |   |   |   |
| Shared across nodes     | ❌ No                 | ✅ Yes        |   |   |   |   |   |   |   |
| Persistent              | ❌ No                 | ✅ Optional   |   |   |   |   |   |   |   |
| Scalability             | Limited              | Excellent    |   |   |   |   |   |   |   |
| Setup complexity        | Simple               | Moderate     |   |   |   |   |   |   |   |
| Cost                    | Free                 | Additional   |   |   |   |   |   |   |   |
| Advanced features       | Basic                | Extensive    |   |   |   |   |   |   |   |
| Suitable for production | Single instance only | Yes          |   |   |   |   |   |   |   |
|                         |                      |              |   |   |   |   |   |   |   |


### commands to start/stop redis

```js
brew services start redis

// TEST
redis-cli ping
// PONG
```
```js
brew services stop redis
```