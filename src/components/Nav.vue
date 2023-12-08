<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="nav" :style="{ width: navWidth }">
    <router-link to="/" class="logo-link"
      ><img src="../assets/logo.png" id="logo-nav" />
      <p class="logo-title">RouteRover</p></router-link
    >
    <!-- <div v-if="isLoggedIn && userRole == 'user'" class="icons-list">
      <router-link to="/categories">
        <div class="icon-row">
          <img
            src="../assets/icons/category.png"
            class="icon-nav"
            title="Категорії"
          />
          <p class="icon-title">Категорії</p>
        </div></router-link
      >
      <router-link to="/routes"
        ><div class="icon-row">
          <img
            src="../assets/icons/route.png"
            class="icon-nav"
            title="Маршрути"
          />
          <p class="icon-title">Маршрути</p>
        </div></router-link
      >
      <router-link to="/bus-stops"
        ><div class="icon-row">
          <img
            src="../assets/icons/bus-stop.png"
            class="icon-nav"
            title="Зупинки"
          />
          <p class="icon-title">Зупинки</p>
        </div></router-link
      >
    </div> -->
    <div v-if="isLoggedIn && userRole == 'admin'" class="icons-list">
      <router-link to="/admin-panel">
        <div class="icon-row">
          <img
            src="../assets/icons/control-panel.png"
            class="icon-nav"
            title="Адмін-панель"
          />
          <p class="icon-title">Керування</p>
        </div></router-link
      >
    </div>
    <div
      class="closed-island"
      :class="{ 'expanded-island': isExpanded }"
      @click="toggleNav"
    >
      <img
        src="../assets/icons/right-arrow-yellow.png"
        class="icon-nav arrow"
        :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
        title="Розгорнути"
      />
    </div>
    <router-link to="/profile" class="user">
      <img :src="userPic" id="nav-user-img" />
      <p class="nav-user-name">{{ userName }}</p>
    </router-link>
    <div class="logout">
      <img
        v-if="isLoggedIn"
        src="../assets/icons/logout.png"
        class="icon-nav"
        title="Вихід"
        @click="logout"
      />
    </div>
    <router-link to="/auth" class="logout">
      <img
        v-if="!isLoggedIn"
        src="../assets/icons/enter.png"
        class="icon-nav"
        title="Вихід"
      />
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useRouter } from "vue-router";

const navWidth = ref("80px");
const isExpanded = ref(false);
const router = useRouter();
const isLoggedIn = ref("");
const userEmail = ref("");
const userName = ref("");
const userPic = ref("");
const userRole = ref("");

const auth = getAuth();
const firestore = getFirestore();

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      isLoggedIn.value = true;
      userEmail.value = user.email;

      const userDocRef = doc(firestore, "users", user.email);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        userName.value = userData.name;
        userPic.value = userData.userPic || "";
        userRole.value = userData.role;
      } else {
        //empty
      }
    } else {
      isLoggedIn.value = false;
    }
  });
});

const toggleNav = () => {
  isExpanded.value = !isExpanded.value;
  navWidth.value = isExpanded.value ? "215px" : "80px";
};

const logout = async () => {
  try {
    await signOut(auth);
    // Redirect or perform any other action after logout
    router.push("/auth");
  } catch (error) {
    console.error("Logout error", error.message);
  }
};
</script>

<style>
.nav {
  position: fixed;
  background-color: #474747;
  height: 100vh;
  box-shadow: rgba(0, 0, 0, 0.4) 2px 0px 4px,
    rgba(0, 0, 0, 0.3) 7px 0px 13px -3px, rgba(0, 0, 0, 0.2) -3px 0px 0px inset;
  display: flex;
  flex-direction: column;
  transition: width 0.5s ease;
  overflow: hidden;
  align-items: flex-start;
  z-index: 100;
}
#logo-nav {
  width: 50px;
  height: 50px;
}
.icons-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  gap: 30px;
}
.icon-nav {
  width: 27px;
}
.icons-list-bottom {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  gap: 30px;
}
.logout {
  position: fixed;
  bottom: 35px;
  left: 27px;
}
.closed-island {
  position: fixed;
  bottom: 130px;
  left: 65px;
  background-color: #474747;
  padding: 15px 5px 13px 15px;
  border-radius: 5px;
  transition: width 0.5s ease, left 0.5s ease, transform 0.5s ease;
}
.icon-nav.arrow {
  transition: transform 0.5s ease;
}
.icon-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
  text-decoration: none !important;
  width: 215px;
  border-radius: 5px;
  transition: ease-in-out 0.2s;
}

.icon-row:hover {
  box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px,
    rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px,
    rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
}

.icon-title {
  text-decoration: none !important;
  font-size: 16px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #fff;
}
a {
  text-decoration: none !important;
}
.logo-link {
  margin: 40px 15px 15px 15px;
  text-decoration: none !important;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.logo-title {
  text-decoration: none !important;
  font-size: 20px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #f6c53e;
}
.expanded-island {
  left: 200px;
  transition: width 0.5s ease, left 0.5s ease;
}
.nav-user-name {
  font-size: 16px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #fff;
  margin-left: 10px;
}
#nav-user-img {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  position: relative;
  right: 5px;
}
.user {
  width: 215px;
  position: sticky;
  top: 80vh;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  transition: ease-in-out 0.2s;
}
.user:hover {
  box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px,
    rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px,
    rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
}
</style>
