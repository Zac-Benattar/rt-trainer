<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	let internalName = Math.random().toString(36).substring(7);

	const dispatch = createEventDispatcher();

	const handleDialClick = () => {
		const frequencyDial = document.getElementById(
			'frequency-dial-' + internalName
		) as HTMLDivElement;
		if (frequencyDial != null) {
			// Implement this!
			console.log('Feature not implemented');
		}
	};

	function handleDialArrowClick(event: Event) {
		var tgt = event.target as HTMLDivElement;
		if (tgt.id == 'left-arrow-div-' + internalName) {
			console.log('Left arrow clicked');
			dispatch('dialAntiClockwiseTurn');
		} else {
			console.log('Right arrow clicked');
			dispatch('dialClockwiseTurn');
		}
	}

	function addArrows() {
		console.log('Adding arrows');
		var DialAndModesContainer = document.getElementById(
			'dial-and-frequency-container-' + internalName
		) as HTMLDivElement;
		var ArrowContainer = document.getElementById(
			'arrow-container-' + internalName
		) as HTMLDivElement;

		// Add direction arrows
		var LeftArrow = document.createElement('div');
		var RightArrow = document.createElement('div');
		var LeftArrowImg = document.createElement('svg');
		var RightArrowImg = document.createElement('svg');
		var LeftArrowg = document.createElement('g');
		var RightArrowg = document.createElement('g');
		var LeftArrowLinePath = document.createElement('path');
		var RightArrowLinePath = document.createElement('path');
		var LeftArrowHeadPath = document.createElement('path');
		var RightArrowHeadPath = document.createElement('path');

		LeftArrow.setAttribute(
			'style',
			'position: absolute; left: 8px; top: 30%; width: 14px; pointer-events: none;'
		);
		RightArrow.setAttribute(
			'style',
			'position: absolute; right: 8px; top: 30%; width: 14px; pointer-events: none;'
		);

		LeftArrowg.setAttribute('opacity', '0.25');
		RightArrowg.setAttribute('opacity', '0.25');

		LeftArrowHeadPath.setAttribute('data-name', 'X jog left arrow');
		LeftArrowHeadPath.setAttribute('d', 'M2.7 3.55v2.7H0');
		LeftArrowHeadPath.setAttribute('fill', '#fff');

		RightArrowHeadPath.setAttribute('data-name', 'X jog right arrow');
		RightArrowHeadPath.setAttribute('d', 'M1.82.15a6.62 6.62 0 01-.47 5.12');
		RightArrowHeadPath.setAttribute('fill', 'none');
		RightArrowHeadPath.setAttribute('stroke', '#fff');
		RightArrowHeadPath.setAttribute('stroke-miterlimit', '10');

		LeftArrowLinePath.setAttribute('data-name', 'X jog left line');
		LeftArrowLinePath.setAttribute('d', 'M1.52 5.29A6.67 6.67 0 011.05.15');
		LeftArrowLinePath.setAttribute('fill', 'none');
		LeftArrowLinePath.setAttribute('stroke', '#fff');
		LeftArrowLinePath.setAttribute('stroke-miterlimit', '10');

		RightArrowLinePath.setAttribute('data-name', 'X jog right line');
		RightArrowLinePath.setAttribute('d', 'M2.7 6.24H0v-2.7');
		RightArrowLinePath.setAttribute('fill', '#fff');

		LeftArrowImg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		LeftArrowImg.setAttribute('viewBox', '0 0 2.7 6.25');

		RightArrowImg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		RightArrowImg.setAttribute('viewBox', '0 0 2.7 6.24');

		DialAndModesContainer.appendChild(LeftArrow);
		DialAndModesContainer.appendChild(RightArrow);
		LeftArrow.appendChild(LeftArrowImg);
		RightArrow.appendChild(RightArrowImg);
		LeftArrowImg.appendChild(LeftArrowg);
		RightArrowImg.appendChild(RightArrowg);
		LeftArrowg.appendChild(LeftArrowLinePath);
		LeftArrowg.appendChild(LeftArrowHeadPath);
		RightArrowg.appendChild(RightArrowLinePath);
		RightArrowg.appendChild(RightArrowHeadPath);

		// Add direction divs
		var LeftDiv = document.createElement('div');
		var RightDiv = document.createElement('div');

		LeftDiv.setAttribute('class', 'w-100 h-100');
		RightDiv.setAttribute('class', 'w-100 h-100');
		LeftDiv.setAttribute('style', 'width: 50%; height: 100%');
		RightDiv.setAttribute('style', 'width: 50%; height: 100%');
		LeftDiv.setAttribute('id', 'left-arrow-div-' + internalName);
		RightDiv.setAttribute('id', 'right-arrow-div-' + internalName);

		ArrowContainer.appendChild(LeftDiv);
		ArrowContainer.appendChild(RightDiv);

		LeftDiv.addEventListener('click', handleDialArrowClick);
		RightDiv.addEventListener('click', handleDialArrowClick);
	}

	onMount(() => {
		addArrows();
	});
</script>

<div
	id={'dial-and-frequency-container-' + internalName}
	class="flex items-center justify-center h-screen"
	style="width: 200px; height: 200px; justify-content: center;"
>
	<div id={'dial-container-' + internalName} class="relative">
		<div
			id={'frequency-center-div-' + internalName}
			class="w-0 h-0 absolute"
			style="top: 50%; left: 50%; transform: rotate(0deg); position: absolute; margin: auto;"
		/>
		<div
			id={'frequency-dial-' + internalName}
			class="frequency-dial flex"
			style="transform: rotate(-150deg);"
		>
			<div
				id={'arrow-container-' + internalName}
				class="absolute flex flex-row w-100 h-100"
				style="top: 0px; left: 0px; width: 100%; height: 100%; transform: rotate(0deg);"
			/>

			<div class="frequency-dial-line center" />
		</div>
	</div>
</div>

<style lang="postcss">
	.frequency-dial {
		width: 80px;
		height: 80px;
		border: 2px solid #fff;
		border-radius: 50%;
		transition: all 0.35s ease-in-out 0s;
		justify-content: center;
		display: flex;
	}

	.frequency-dial-line {
		width: 2px;
		height: 40px;
		background: #fff;
	}
</style>
