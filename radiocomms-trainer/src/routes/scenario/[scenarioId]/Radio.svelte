<script lang="ts">
  export let COMMode: boolean = false;
  export let NAVMode: boolean = false;
  const handleCOMButtonClick = () => {
    const COMModeButton = document.getElementById(
      "radio-button-com"
    ) as HTMLInputElement;
    if (COMModeButton != null) {
      if (!COMMode) {
        COMMode = true;
        COMModeButton.classList.add("active-button");
        if (NAVMode) {
          NAVMode = false;
          const NAVModeButton = document.getElementById(
            "radio-button-nav"
          ) as HTMLInputElement;
          NAVModeButton.classList.remove("active-button");
        }
      }
    }
  };

  const handleNAVButtonClick = () => {
    const NAVModeButton = document.getElementById(
      "radio-button-nav"
    ) as HTMLInputElement;
    if (NAVModeButton != null) {
      if (!NAVMode) {
        NAVMode = true;
        NAVModeButton.classList.add("active-button");
        if (COMMode) {
          COMMode = false;
          const COMModeButton = document.getElementById(
            "radio-button-com"
          ) as HTMLInputElement;
          COMModeButton.classList.remove("active-button");
        }
      }
    }
  };
</script>

<div class="radio-container-outer">
  <div>
    <div>
      <div class="radio-mode-selecter">
        <div class="position-relative">
          <div class="radio-mode-dial">
            <div class="radio-mode-dial-line" />
          </div>
        </div>
        <div class="radio-modes-container">
          <div class="radio-mode-off">OFF</div>
          <div class="radio-mode-standby">STANDBY</div>
        </div>
      </div>

      <div class="radio-display-panel">
        <div class="segmentdisplay radio-display-screen" />
        <div class="radio-display-buttons-container">
          <div class="radio-display-button-container">
            <button
              class="radio-button"
              id="radio-button-com"
              on:click={handleCOMButtonClick}>COM</button
            >
          </div>
          <div class="radio-display-button-container">
            <button class="radio-button" id="radio-button-swap">⇆</button>
          </div>
          <div class="radio-display-button-container">
            <button
              class="radio-button"
              id="radio-button-nav"
              on:click={handleNAVButtonClick}>NAV</button
            >
          </div>
        </div>
      </div>

      <div class="radio-frequency-selecter position-relative">
        <div class="radio-frequency-dial">
          <div class="radio-frequency-dial-left-outer">
            <div class="radio-frequency-dial-left-inner" />
          </div>
          <div class="radio-frequency-dial-right-outer">
            <div class="radio-frequency-dial-right-inner" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .radio-button {
    width: 50px;
  }

  /* Global flag required otherwise .active-button is unused at page load 
  and hence removed by the compiler */
  :global(.active-button) {
    background-color: #afa548;
    color: black;
  }

  .radio-container-outer {
    background-color: rgb(65, 65, 65);
    width: 1000px;
    height: 240px;
  }

  .radio-mode-dial {
    width: 80px;
    height: 80px;
    border: 2px solid #fff;
    border-radius: 50%;
    transform: rotate(0deg);
    transition: all 0.35s ease-in-out 0s;
  }

  .radio-mode-dial-line {
    width: 2px;
    height: 40px;
    background: #fff;
  }
</style>
