<script lang="ts">
	import Radio from './Radio.svelte';
	import Transponder from './Transponder.svelte';
    export let seed = "0";
</script>

<div>
	<div>
		<h1>Simulator</h1>
	</div>
	<div class="radio-transponder-container">
		<slot {Radio} {Transponder}/>
	</div>
</div>
