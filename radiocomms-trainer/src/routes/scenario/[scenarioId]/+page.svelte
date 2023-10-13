<script lang="ts">
  import { page } from "$app/stores";
  const scenarioId = $page.params.scenarioId;
  const unexpectedEvents = $page.url.searchParams.get("unexpectedEvents");
  let COMMode: boolean = false;
  let NAVMode: boolean = false;

  const handleCOMButtonClick = () => {
    console.log("COM button clicked");
    const COMModeButton = document.getElementById(
      "radio-button-com"
    ) as HTMLInputElement;
    console.log(COMModeButton);
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

<h1>Scenario {scenarioId}</h1>

<div>
  <div>
    <div>
      <div class="radio-mode-selecter">
        <div class="position-relative">
          <div class="radio-mode-wheel">
            <div class="radio-mode-wheel-line" />
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
            <button class="radio-button" id="radio-button-com" on:click={handleCOMButtonClick}
              >COM</button
            >
          </div>
          <div class="radio-display-button-container">
            <button class="radio-button" id="radio-button-swap">SWAP</button>
          </div>
          <div class="radio-display-button-container">
            <button class="radio-button" id="radio-button-nav" on:click={handleNAVButtonClick}
              >NAV</button
            >
          </div>
        </div>
      </div>

      <div class="radio-frequency-selecter">
        <div class="radio-frequency-wheel">
          <div class="radio-frequency-wheel-left-outer">
            <div class="radio-frequency-wheel-left-inner" />
          </div>
          <div class="radio-frequency-wheel-right-outer">
            <div class="radio-frequency-wheel-right-inner" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
