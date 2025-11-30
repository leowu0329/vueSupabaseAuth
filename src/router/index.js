import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/hello",
    name: "Home",
    component: HelloWorld,
    props: { msg: "妹妹 + 武村" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
