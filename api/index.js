const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

const users = [{
    id: "1",
    username: "sameer",
    password: "1234"
  },
  {
    id: "2",
    username: "jane",
    password: "1234"
  },
];

let refreshTokens = [];

app.get('/', (req, res) => {
  res.send("TESTING.....")
})

app.post("/api/refresh", (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }
  jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, user) => {
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  //if everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign({
    id: user.id,
    username: user.username
  }, process.env.ACCESS_SECRET_KEY, {
    expiresIn: "20s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({
    id: user.id,
    username: user.username
  }, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "40s",
  });
};

app.get("/login", (req, res) => {
  res.render('index');
})

app.post("/login", (req, res) => {

  const {
    username,
    password
  } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    //Generate an access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      status: 200,
      username: user.username,
      accessToken,
      refreshToken,
    });
  } else {
    res.status(404).json("Username or password incorrect!");
  }
});

//Middleware
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({
          "message": "Token is not valid!"
        });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

app.get("/secure-page", (req, res) => {
  res.render('securePage');
});

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully.");
});
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`server is running on port ${PORT}...`));