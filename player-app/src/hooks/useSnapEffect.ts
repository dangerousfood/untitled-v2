import { useState, useRef, useEffect } from "react";

interface Snap {
  count: number;
  id: number;
  timestamp: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

export const useSnapEffect = () => {
  const [snapCount, setSnapCount] = useState(0);
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [lastSnap, setLastSnap] = useState<Snap | null>(null);
  const snapIntervalRef = useRef<number | null>(null);
  const currentSnapCountRef = useRef(0);
  const [showUndoButton, setShowUndoButton] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [undoButtonStyle, setUndoButtonStyle] = useState({});
  const isUndoButtonVisible = useRef(false);
  const isHoldingRef = useRef(false);
  const postHoldTimerRef = useRef<NodeJS.Timeout>(null);
  const buttonPositionRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const clearedSnapsRef = useRef(new Set());
  const isAutoResettingRef = useRef(false);

  // Helper function to generate a random pastel color in the rainbow spectrum
  const getRandomPastelColor = () => {
    // Generate a random hue (0-360)
    const hue = Math.floor(Math.random() * 360);
    // Use high saturation and lightness values for pastel effect
    const saturation = Math.floor(60 + Math.random() * 15); // 60-75%
    const lightness = Math.floor(75 + Math.random() * 15); // 75-90%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Helper function to animate the last snap away
  const animateLastSnapAway = () => {
    if (lastSnap) {
      // Create an animated version of the last snap
      const animatedLastSnap = {
        ...lastSnap,
        id: Date.now() + Math.random(), // new ID to avoid conflicts
        timestamp: Date.now(), // fresh timestamp for proper cleanup
      };

      // Add this animated version to the snaps array and clear the lastSnap
      setSnaps((prevSnaps) => {
        // Return new snaps without the static last snap but with animated version
        return [
          ...prevSnaps.filter((snap) => snap.id !== lastSnap.id),
          animatedLastSnap,
        ];
      });

      // Clear the last snap reference
      setLastSnap(null);
    }
  };

  // Add a new snap number with animation
  const addSnapNumber = (newCount: number) => {
    // Adjust positioning for better leaf-like motion
    // Use wider horizontal variation for natural dispersion
    const randomOffsetX = Math.random() * 20 - 10; // Wider horizontal variation

    // Position numbers much closer to the button's center or even slightly inside it
    // Using higher positive values will place the numbers visibly lower/closer to the button
    const startingY = 25 + Math.random() * 5; // Position numbers more visibly on the button

    const newSnap = {
      count: newCount,
      id: Date.now() + Math.random(), // ensure unique IDs
      timestamp: Date.now(),
      x: 37.5 + randomOffsetX, // Center horizontally with natural random offset
      y: startingY, // Position more visibly on the button
      // Add a more moderate random rotation
      rotate: Math.random() * 15 - 7.5, // Random rotation between -7.5 and 7.5 degrees
      // Assign a random pastel color
      color: getRandomPastelColor(),
    };

    // After an undo, completely clear all previous snaps when adding a new one
    if (snapCount === 0 && lastSnap === null) {
      setSnaps([newSnap]); // Reset to just the new snap
      clearedSnapsRef.current = new Set(); // Reset cleared snaps tracking
    }
    // Normal case - handle last snap replacement
    else {
      // If there was a previous last snap, we need to remove it from state
      // since it will now be replaced by the new last snap
      if (lastSnap) {
        // Don't modify previous snaps, they should animate normally
        setSnaps((prevSnaps) => [
          ...prevSnaps.filter((snap) => snap.id !== lastSnap.id),
          newSnap,
        ]);
      } else {
        // If no previous last snap, just add the new one
        setSnaps((prevSnaps) => [...prevSnaps, newSnap]);
      }
    }

    // Update the last snap reference
    setLastSnap(newSnap);
  };

  // Helper function to hide the undo button with animation
  const hideUndoButton = () => {
    // Only do something if the undo button is visible
    if (isUndoButtonVisible.current) {
      // Hide undo button with animation
      setUndoButtonStyle({
        opacity: 0,
        transform: "translateX(-50%) translateY(-60px)",
      });

      setTimeout(() => {
        setShowUndoButton(false);
        isUndoButtonVisible.current = false;
      }, 300);

      // Clear any existing timeout for the undo button
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
    }
  };

  // Helper function to show undo button with timeout
  const showUndoButtonWithTimeout = () => {
    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // If undo button is already visible, just reset the timer without animating
    if (isUndoButtonVisible.current) {
      // Set a new timeout to hide after 2 seconds (increased from 1.5 seconds)
      undoTimeoutRef.current = setTimeout(() => {
        // First fade out and move back up
        setUndoButtonStyle({
          opacity: 0,
          transform: "translateX(-50%) translateY(-60px)",
        });

        // Then hide the element after animation completes and reset count
        setTimeout(() => {
          setShowUndoButton(false);
          isUndoButtonVisible.current = false;

          // Mark that we're auto-resetting
          isAutoResettingRef.current = true;

          // Reset the snap count to 0
          setSnapCount(0);
          currentSnapCountRef.current = 0;

          // Animate away the last snap
          animateLastSnapAway();

          // Reset the auto-resetting flag after a delay
          setTimeout(() => {
            isAutoResettingRef.current = false;
          }, 2500); // Match animation duration
        }, 300); // Match the transition duration
      }, 2000); // Increased from 1500 to 2000 (2 seconds)

      return; // Skip the rest of the function
    }

    // Set initial style for appearing - start hidden and at the position of the snap button
    setUndoButtonStyle({
      opacity: 0,
      transform: "translateX(-50%) translateY(-60px)", // Move up to overlap with snap button
    });

    // Show the button container
    setShowUndoButton(true);
    isUndoButtonVisible.current = true;

    // Trigger animation after a tiny delay to ensure state updates
    setTimeout(() => {
      setUndoButtonStyle({
        opacity: 1,
        transform: "translateX(-50%) translateY(0)", // Move down to its normal position
      });
    }, 10);

    // Hide after 2 seconds and reset count to 0 (increased from 1.5 seconds)
    undoTimeoutRef.current = setTimeout(() => {
      // First fade out and move back up
      setUndoButtonStyle({
        opacity: 0,
        transform: "translateX(-50%) translateY(-60px)",
      });

      // Then hide the element after animation completes and reset count
      setTimeout(() => {
        setShowUndoButton(false);
        isUndoButtonVisible.current = false;

        // Mark that we're auto-resetting
        isAutoResettingRef.current = true;

        // Reset the snap count to 0
        setSnapCount(0);
        currentSnapCountRef.current = 0;

        // Animate away the last snap
        animateLastSnapAway();

        // Reset the auto-resetting flag after a delay
        setTimeout(() => {
          isAutoResettingRef.current = false;
        }, 2500); // Match animation duration
      }, 300); // Match the transition duration
    }, 2000); // Increased from 1500 to 2000 (2 seconds)
  };

  // Handle a single snap click
  const handleSnapClick = (e: React.SyntheticEvent) => {
    // Only process clicks that aren't part of a hold action
    if (isHoldingRef.current) {
      return;
    }

    // Stop propagation to prevent profile popup
    e.stopPropagation();

    // Always hide the undo button immediately on any new press
    hideUndoButton();

    // Increment count and add a new number
    const newCount = currentSnapCountRef.current + 1;
    setSnapCount(newCount);
    addSnapNumber(newCount);

    // Clear any existing debounce timer
    if (clickDebounceRef.current) {
      clearTimeout(clickDebounceRef.current);
    }

    // Set a debounce timer before showing the undo button (only for single clicks)
    clickDebounceRef.current = setTimeout(() => {
      // Show the undo button after debounce
      showUndoButtonWithTimeout();
      clickDebounceRef.current = null;
    }, 500); // 500ms debounce before showing the undo button
  };

  // Start continuous snapping when button is held
  const startContinuousSnap = (e: React.SyntheticEvent) => {
    // Stop propagation to prevent profile popup
    e.stopPropagation();

    // Prevent default browser behavior (dragging the image)
    e.preventDefault();

    // Update button position for mouse distance tracking
    if (e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      buttonPositionRef.current = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }

    // Mark that we're holding the button
    isHoldingRef.current = true;

    // Cancel any pending debounce timer for single clicks
    if (clickDebounceRef.current) {
      clearTimeout(clickDebounceRef.current);
      clickDebounceRef.current = null;
    }

    // Always hide the undo button immediately on any new press
    hideUndoButton();

    // Store whether we were at a clean slate before starting continuous snapping
    const wasCleanSlate = snapCount === 0 && lastSnap === null;

    // Handle the initial click immediately
    const newCount = currentSnapCountRef.current + 1;
    setSnapCount(newCount);

    // For continuous snapping, we need special handling for the first number
    const firstSnap = {
      count: newCount,
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      x: 37.5 + (Math.random() * 20 - 10),
      y: 25 + Math.random() * 5, // Match the lower Y position used in addSnapNumber
      rotate: Math.random() * 15 - 7.5, // Reduced to ±7.5 degrees to match addSnapNumber
      color: getRandomPastelColor(), // Add random pastel color
    };

    // If we're starting from a clean slate after undo, completely reset the snaps array
    if (wasCleanSlate) {
      setSnaps([firstSnap]);
      clearedSnapsRef.current = new Set();
    } else if (lastSnap) {
      // If there was a previous last snap, replace it with the new one
      setSnaps((prevSnaps) => [
        ...prevSnaps.filter((snap) => snap.id !== lastSnap.id),
        firstSnap,
      ]);
    } else {
      // Otherwise just add the new snap
      setSnaps((prevSnaps) => [...prevSnaps, firstSnap]);
    }

    // Update the last snap reference
    setLastSnap(firstSnap);

    // Variables to track continuous snapping
    let continuousCount = newCount;
    const startTime = Date.now();
    let lastUpdateTime = startTime;

    // Start with relatively slow snapping
    const initialInterval = 100; // 10 snaps per second
    const minInterval = 3.33; // Maximum speed of 300 snaps per second (1000ms / 300 = 3.33ms)
    const rampUpDuration = 3000; // Time in ms to reach maximum speed (3 seconds)

    // Function to calculate current interval based on time held
    const calculateInterval = (elapsedTime: number) => {
      // Start with initial interval and decrease exponentially
      // until reaching minimum interval after rampUpDuration
      if (elapsedTime >= rampUpDuration) {
        return minInterval; // Maximum speed reached
      }

      // Exponential decrease: from initialInterval to minInterval
      // Using quadratic easing: progress² gives exponential feel
      const progress = elapsedTime / rampUpDuration;
      const progressSquared = progress * progress;

      // Calculate interval: starts at initialInterval, ends at minInterval
      return (
        initialInterval - progressSquared * (initialInterval - minInterval)
      );
    };

    // Use RAF for smoother snapping that can adapt to device capabilities
    const updateSnaps = () => {
      if (!snapIntervalRef.current) return; // Stop if interval reference is cleared

      const now = Date.now();
      const elapsedTime = now - startTime;
      const currentInterval = calculateInterval(elapsedTime);

      // Only add a new snap if enough time has passed based on current interval
      if (now - lastUpdateTime >= currentInterval) {
        // At very high speeds (near 300/sec), batch updates to reduce React rendering load
        // This helps maintain UI responsiveness while still counting correctly
        const batchSize = elapsedTime > rampUpDuration / 2 ? 3 : 1;

        // Update the count by batch size
        continuousCount += batchSize;
        const nextCount = continuousCount;

        // Create a new snap object for each continuous snap
        const newContinuousSnap = {
          count: nextCount,
          id: now + Math.random(),
          timestamp: now,
          x: 37.5 + (Math.random() * 20 - 10),
          y: 25 + Math.random() * 5,
          rotate: Math.random() * 15 - 7.5, // Reduced to ±7.5 degrees to match addSnapNumber
          color: getRandomPastelColor(), // Add random pastel color
        };

        // Replace the last snap with this new one
        setSnaps((prevSnaps) => {
          // If there's a last snap, filter it out
          const filteredSnaps = lastSnap
            ? prevSnaps.filter((snap) => snap.id !== lastSnap.id)
            : prevSnaps;

          // Return with the new snap added
          return [...filteredSnaps, newContinuousSnap];
        });

        // Update the count state and lastSnap reference
        setSnapCount(nextCount);
        setLastSnap(newContinuousSnap);
        currentSnapCountRef.current = nextCount;

        // Update last update time
        lastUpdateTime = now;
      }

      // Continue the animation loop
      snapIntervalRef.current = requestAnimationFrame(updateSnaps);
    };

    // Start the animation loop
    snapIntervalRef.current = requestAnimationFrame(updateSnaps);
  };

  // Stop continuous snapping
  const stopContinuousSnap = (e: React.SyntheticEvent) => {
    // If e exists, stop propagation to prevent profile popup
    if (e) {
      e.stopPropagation();
    }

    if (snapIntervalRef.current) {
      // Cancel the animation frame
      cancelAnimationFrame(snapIntervalRef.current);
      snapIntervalRef.current = null;

      // Keep the holding flag true briefly to prevent the click event from firing
      // This addresses the issue where releasing a hold can trigger a click
      if (postHoldTimerRef.current) {
        clearTimeout(postHoldTimerRef.current);
      }

      postHoldTimerRef.current = setTimeout(() => {
        isHoldingRef.current = false;
        postHoldTimerRef.current = null;
      }, 100); // Small delay to ensure click doesn't fire after hold

      // Wait a short debounce time before showing the undo button
      clickDebounceRef.current = setTimeout(() => {
        // Show the undo button when continuous snapping stops (debounced)
        // Use 0 as the previous count for undo (to reset)
        showUndoButtonWithTimeout();
        clickDebounceRef.current = null;
      }, 500); // Match the single-click debounce time
    }
  };

  // Handle undoing a snap
  const handleUndoSnap = (e: React.SyntheticEvent) => {
    // Stop propagation to prevent profile popup
    e.stopPropagation();

    // Prevent default browser behavior (dragging the image)
    e.preventDefault();

    // Reset the snap count to 0
    setSnapCount(0);
    currentSnapCountRef.current = 0;

    // For undo, we DON'T want to animate the last snap away
    // We just want to clear it from the display entirely
    if (lastSnap) {
      // Add the previous last snap ID to the cleared set so we remember we've already handled it
      clearedSnapsRef.current.add(lastSnap.id);

      // Just clear the last snap without animating it
      setLastSnap(null);

      // Remove the last snap from the snaps array entirely without animation
      setSnaps((prevSnaps) =>
        prevSnaps.filter((snap) => snap.id !== lastSnap.id)
      );
    }

    // Hide the undo button
    setUndoButtonStyle({
      opacity: 0,
      transform: "translateX(-50%) translateY(-60px)",
    });

    // Hide after animation completes
    setTimeout(() => {
      setShowUndoButton(false);
      isUndoButtonVisible.current = false;
    }, 300);

    // Clear the timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
  };

  // Clean up any snaps after they animate out
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only keep snaps that are still within animation time or are the last snap
      setSnaps((snaps) =>
        snaps.filter(
          (snap) =>
            Date.now() - snap.timestamp < 2500 ||
            (lastSnap && snap.id === lastSnap.id)
        )
      );
    }, 2500);

    return () => clearTimeout(timer);
  }, [snaps, lastSnap]);

  // Update the ref when snapCount changes
  useEffect(() => {
    currentSnapCountRef.current = snapCount;
  }, [snapCount]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (snapIntervalRef.current) {
        cancelAnimationFrame(snapIntervalRef.current);
        snapIntervalRef.current = null;
      }

      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }

      if (clickDebounceRef.current) {
        clearTimeout(clickDebounceRef.current);
        clickDebounceRef.current = null;
      }

      if (postHoldTimerRef.current) {
        clearTimeout(postHoldTimerRef.current);
        postHoldTimerRef.current = null;
      }
    };
  }, []);

  return {
    snapCount,
    snaps: snaps || [],
    lastSnap,
    showUndoButton,
    undoButtonStyle: undoButtonStyle || {},
    isAutoResetting: isAutoResettingRef.current || false,
    handleSnapClick,
    startContinuousSnap,
    stopContinuousSnap,
    handleUndoSnap,
  };
};
