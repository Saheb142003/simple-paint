document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("paintCanvas");
  const ctx = canvas.getContext("2d");
  const draggableBox = document.getElementById("draggableBox");
  const dragButton = document.querySelector(".dragButton");
  const penRange = document.querySelector(".penRange");
  const clearCanvasButton = document.querySelector(".clearCanvas");
  const undoButton = document.querySelector(".undoLast");
  const colorInput = document.querySelector(".setcol");
  const boxes = document.querySelectorAll(".box");

  let isDrawing = false;
  let penColor = "black";
  let penSize = penRange.value;
  let drawnPaths = [];
  let undoStack = [];
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // Setup the canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Helper function to get the correct coordinates for touch and mouse
  function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // Begin drawing
  function startDrawing(e) {
    if (!isDragging) {
      isDrawing = true;
      const coords = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      saveDrawingState();
    }
  }

  function draw(e) {
    if (isDrawing) {
      const coords = getCoordinates(e);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
  }

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // Touch events for mobile devices
  canvas.addEventListener("touchstart", startDrawing);
  canvas.addEventListener("touchmove", draw);
  canvas.addEventListener("touchend", stopDrawing);

  // Change pen size
  penRange.addEventListener("input", function () {
    penSize = penRange.value;
  });

  // Handle color selection
  boxes.forEach(function (box) {
    box.addEventListener("click", function () {
      boxes.forEach(function (b) {
        b.classList.remove("active");
      });
      this.classList.add("active");
      penColor = this.style.backgroundColor;
    });
  });

  // Color picker functionality
  colorInput.addEventListener("input", function () {
    penColor = this.value;
    boxes.forEach((b) => b.classList.remove("active"));
  });

  // Clear the canvas
  clearCanvasButton.addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnPaths = [];
    undoStack = [];
  });

  // Undo last action
  undoButton.addEventListener("click", function () {
    if (drawnPaths.length > 0) {
      undoStack.push(drawnPaths.pop());
      redraw();
    }
  });

  // Save drawing state for undo
  function saveDrawingState() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawnPaths.push(imgData);
  }

  // Redraw the canvas
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (drawnPaths.length > 0) {
      ctx.putImageData(drawnPaths[drawnPaths.length - 1], 0, 0);
    }
  }

  // Drag functionality for the sidebar
  function startDragging(e) {
    e.preventDefault(); // Prevent default to avoid unwanted behavior on mobile
    isDragging = true;
    const coords = getCoordinates(e);
    offsetX = coords.x - draggableBox.offsetLeft;
    offsetY = coords.y - draggableBox.offsetTop;
    dragButton.style.cursor = "grabbing";
  }

  function drag(e) {
    if (isDragging) {
      const coords = getCoordinates(e);
      let newLeft = coords.x - offsetX;
      let newTop = coords.y - offsetY;

      // Ensure the box stays within the viewport
      newLeft = Math.max(
        0,
        Math.min(window.innerWidth - draggableBox.offsetWidth, newLeft)
      );
      newTop = Math.max(
        0,
        Math.min(window.innerHeight - draggableBox.offsetHeight, newTop)
      );

      draggableBox.style.left = `${newLeft}px`;
      draggableBox.style.top = `${newTop}px`;
    }
  }

  function stopDragging() {
    isDragging = false;
    dragButton.style.cursor = "grab";
  }

  dragButton.addEventListener("mousedown", startDragging);
  dragButton.addEventListener("touchstart", startDragging);

  document.addEventListener("mousemove", drag);
  document.addEventListener("touchmove", drag);

  document.addEventListener("mouseup", stopDragging);
  document.addEventListener("touchend", stopDragging);
});
