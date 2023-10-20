<script lang="ts">
    export let displayOn: boolean = false;
    export let mode: string = 'OFF';

    $:showDisplayText = displayOn ? '' : 'displayoff';
</script>

<link
	rel="stylesheet"
	media="screen"
	href="https://fontlibrary.org//face/segment7"
	type="text/css"
/>

<div class="segdisplay {showDisplayText} card flex flex-row nowrap items-center place-content-between">
	<div>
		<div class="mode-icon">{mode}</div>
	</div>
	<div class="sevenSEG flex flex-row">
        <div class="digit">0</div>
        <div class="digit">0</div>
        <div class="digit">0</div>
        <div class="digit">0</div>
    </div>
</div>

<style lang="postcss">
	.segdisplay {
		border-style: solid;
		border-color: white;
		border-width: 1px;
		width: 100%;
		height: 90px;
        transition: all 0.4 ease-in-out 0s;
        background: rgba(var(--color-surface-900) / 1);
	}

    :global(.displayoff) {
        color: rgba(var(--color-surface-900) / 1);
    }

	.segdisplay .mode-icon {
		font-family: Segment7Standard;
		font-size: 20px;
		text-algin: left;
		padding: 2px;
		margin-left: 16px;
	}

    .segdisplay .sevenSEG {
        font-size: 50px;
        opacity: 1;
        margin-right:40px;
    }

	.segdisplay .digit {
		font-family: Segment7Standard;
		text-algin: right;
        padding: 8px 0px;
	}
</style>
