/*:
 * @plugindesc Triggers a user-defined control switch when a user-defined button sequence is entered. Now supports touch gestures on iOS.
 * @author thenbexperience
 *
 * @param SwitchID
 * @text Switch ID
 * @type switch
 * @desc The ID of the switch to activate when the button sequence is entered.
 * @default 3
 *
 * @param ButtonSequence
 * @text Button Sequence
 * @type text
 * @desc A comma-separated list of key codes that must be entered in order.
 * @default 38,38,40,40,37,39,37,39,88,90
 *
 * @help
 * This plugin allows the player to activate a specific switch when entering 
 * a user-defined button sequence using key codes instead of key names.
 * Players can use between 1 and 10 keys in a sequence.
 *
 * Now supports touch gestures on iOS instead of on-screen buttons.
 */

(function () {
    const parameters = PluginManager.parameters('CheatCodeMakerMobile');
    const switchId = Number(parameters['SwitchID']) || 3;
    const buttonSequence = parameters['ButtonSequence'].split(',').map(num => Number(num.trim()));

    if (buttonSequence.length < 1 || buttonSequence.length > 10) {
        console.error('Button sequence must be between 1 and 10 keys.');
        return;
    }

    let inputSequence = [];

    const checkButtonSequence = () => {
        if (inputSequence.length === buttonSequence.length) {
            if (inputSequence.every((key, index) => key === buttonSequence[index])) {
                $gameSwitches.setValue(switchId, true);
                console.log('Button sequence entered! Switch ' + switchId + ' is now ON.');
                inputSequence = [];
            }
        }
    };

    const inputHandler = (keyCode) => {
        inputSequence.push(keyCode);
        if (inputSequence.length > buttonSequence.length) {
            inputSequence.shift();
        }
        checkButtonSequence();
    };

    document.addEventListener('keydown', (event) => inputHandler(event.keyCode));

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;

    if (isTouchDevice) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        });

        document.addEventListener('touchend', (event) => {
            touchEndX = event.changedTouches[0].clientX;
            touchEndY = event.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            let gestureCode = null;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                gestureCode = deltaX > 0 ? 39 : 37; // Right or Left
            } else {
                gestureCode = deltaY > 0 ? 40 : 38; // Down or Up
            }

            inputHandler(gestureCode);
        });

        document.addEventListener('touchend', (event) => {
            if (event.touches.length === 1) {
                inputHandler(88); // 1 finger tap -> X key
            } else if (event.touches.length === 2) {
                inputHandler(90); // 2 finger tap -> Z key
            }
        });
    }
})();
