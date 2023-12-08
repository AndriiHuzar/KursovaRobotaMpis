<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="auth">
    <div class="auth-island">
      <div class="auth-title">
        <img src="../assets/logo.png" alt="" id="title-logo" />
        <p id="title-name">RouteRover</p>
      </div>
      <div class="inputs-list">
        <input
          type="text"
          class="auth-input"
          placeholder="Логін"
          v-model="email"
        />
        <input
          type="password"
          class="auth-input"
          placeholder="Пароль"
          v-model="password"
        />
      </div>
      <p v-if="errMsg" class="error-auth">{{ errMsg }}</p>
      <button id="login-button" @click="login">Увійти</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const errMsg = ref();
const router = useRouter();

const login = () => {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      console.log("logged in");
      router.push("/");
      location.replace("/");
    })
    .catch((error) => {
      console.log(error.code);
      switch (error.code) {
        case "auth/invalid-email":
          errMsg.value = "Invalid email address format";
          break;
        case "auth/user-disabled":
          errMsg.value = "User disabled";
          break;
        case "auth/user-not-found":
          errMsg.value = "User not found";
          break;
        case "auth/wrong-password":
          errMsg.value = "Wrong password";
          break;
        default:
          errMsg.value = "Something went wrong";
      }
    });
};

addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("login-button").click();
  }
});
</script>

<style>
.auth {
  background-image: url("https://firebasestorage.googleapis.com/v0/b/kursova-a5f23.appspot.com/o/blured5.webp?alt=media&token=21e1262c-b6b4-4c6b-a788-09201561296b");
  height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.nav{
    display: none;
}
.auth-island {
  background-color: #474747;
  width: 450px;
  height: 400px;
  border-radius: 7px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.auth-title {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-top: 50px;
  width: 450px;
  gap: 15px;
}
#title-logo {
  width: 70px;
}
#title-name {
  font-size: 25px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #f6c53e;
}
.inputs-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  width: 375px;
  gap: 25px;
  margin: 0 auto;
}
.auth-input {
  width: 305px;
  height: 35px;
  border-radius: 7px;
  border: none;
  outline: none;
  padding-left: 20px;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
#login-button {
  width: 155px;
  height: 35px;
  border-radius: 7px;
  border: none;
  outline: none;
  background-color: #f6c53e;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  cursor: pointer;
  margin: 40px auto 0 auto;
  transition: ease-in-out 0.1s;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
#login-button:active {
  font-size: 15px;
  transition: ease-in-out 0.1s;
}
.error-auth {
  font-size: 15px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #f63e3e;
  margin: 0 auto;
  padding-top: 10px;
  position: absolute;
  top: 67%;
  left: 28%;
}
</style>
