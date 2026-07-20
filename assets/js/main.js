(function () {
	"use strict";

	/* Sticky nav shadow */
	var nav = document.querySelector(".nav");
	var onScroll = function () {
		if (window.scrollY > 8) nav.classList.add("is-scrolled");
		else nav.classList.remove("is-scrolled");
	};
	document.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	/* Mobile nav toggle */
	var toggle = document.querySelector(".nav-toggle");
	var mobilePanel = document.querySelector(".nav-mobile-panel");
	if (toggle && mobilePanel) {
		toggle.addEventListener("click", function () {
			mobilePanel.classList.toggle("is-open");
		});
		mobilePanel.querySelectorAll("a").forEach(function (link) {
			link.addEventListener("click", function () {
				mobilePanel.classList.remove("is-open");
			});
		});
	}

	/* Scroll reveal */
	var revealEls = document.querySelectorAll(".reveal");
	if ("IntersectionObserver" in window && revealEls.length) {
		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12 }
		);
		revealEls.forEach(function (el) { observer.observe(el); });
	} else {
		revealEls.forEach(function (el) { el.classList.add("is-visible"); });
	}

	/* Project filtering */
	var filterButtons = document.querySelectorAll(".filter-btn");
	var filterables = document.querySelectorAll("[data-category]");
	filterButtons.forEach(function (btn) {
		btn.addEventListener("click", function () {
			filterButtons.forEach(function (b) { b.classList.remove("is-active"); });
			btn.classList.add("is-active");
			var filter = btn.getAttribute("data-filter");
			filterables.forEach(function (card) {
				var match = filter === "all" || card.getAttribute("data-category") === filter;
				card.hidden = !match;
			});
		});
	});

	/* Dashboard modal (lazy-loaded iframe) */
	var modalOverlay = document.querySelector(".modal-overlay");
	var modalFrame = document.querySelector(".modal-frame-wrap iframe");
	var modalTitle = document.querySelector(".modal-head h3");
	var modalClose = document.querySelector(".modal-close");

	function openModal(embedUrl, title) {
		modalFrame.src = embedUrl;
		modalTitle.textContent = title || "Live dashboard";
		modalOverlay.classList.add("is-open");
		document.body.style.overflow = "hidden";
	}

	function closeModal() {
		modalOverlay.classList.remove("is-open");
		modalFrame.src = "";
		document.body.style.overflow = "";
	}

	document.querySelectorAll("[data-embed]").forEach(function (trigger) {
		trigger.addEventListener("click", function (e) {
			e.preventDefault();
			openModal(trigger.getAttribute("data-embed"), trigger.getAttribute("data-title"));
		});
	});

	if (modalClose) modalClose.addEventListener("click", closeModal);
	if (modalOverlay) {
		modalOverlay.addEventListener("click", function (e) {
			if (e.target === modalOverlay) closeModal();
		});
	}
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape") closeModal();
	});
})();
