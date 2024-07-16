# Scrabbl.io

# Prerequisites

* Running Mongo server -- either via Docker:

```bash
docker run --rm -d -p 27017:27017 --name mongo mongo
```

or, if you have one already running in Kubernetes:

```bash
kubectl port-forward service/db 27017:27017
```

You also need a `server/secrets.ts` file and the redirect URI (http://127.0.0.1:8192/api/login-callback) registered in GitLab.

NOTE: if you are having problems with 127.0.0.1, as is usually the case with WSL, change the URL above to use localhost instead, and run your server this way:

```bash
cd server
HOST=localhost npm start
```
