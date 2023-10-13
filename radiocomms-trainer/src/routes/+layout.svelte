<script lang="ts">
  //import "../app.css";
</script>

<nav>
  <ul class="top-navbar">
    <li class="navbar">
      <a class="navbar" href="/">Home</a>
    </li>
    <li class="navbar">
      <a class="navbar" href="/profile">Profile</a>
    </li>
  </ul>
</nav>

<slot />

<footer class="info-footer">
  <a class="footer-link" href="/about">About</a>
</footer>
