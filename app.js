(function () {
  "use strict";

  /* ---------- 演示提示条：高度写入 --demo-h ---------- */
  var demoBar = document.getElementById("demoBar");
  var root = document.documentElement;

  function syncDemoHeight() {
    if (!demoBar || !demoBar.parentNode) {
      root.classList.remove("has-demo");
      root.style.setProperty("--demo-h", "0px");
      return;
    }
    root.classList.add("has-demo");
    root.style.setProperty("--demo-h", demoBar.offsetHeight + "px");
  }

  if (demoBar) {
    var demoClose = document.getElementById("demoBarClose");
    if (demoClose) {
      demoClose.addEventListener("click", function () {
        demoBar.remove();
        syncDemoHeight();
      });
    }
  }
  syncDemoHeight();
  window.addEventListener("resize", syncDemoHeight);

  /* ---------- 头部：滚动后加底色 ---------- */
  var header = document.getElementById("siteHeader");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- 移动端导航 ---------- */
  var nav = document.getElementById("primaryNav");
  var navToggle = document.getElementById("navToggle");

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setNav(false);
  });

  var desktopQuery = window.matchMedia("(min-width: 821px)");
  var onDesktopChange = function (event) {
    if (event.matches) setNav(false);
  };
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", onDesktopChange);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(onDesktopChange);
  }

  /* ---------- 滚动入场 ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-in");
    });
  }

  /* ---------- FAQ 手风琴：同时只展开一条 ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  /* ---------- 办公状态（工作日 09:00–18:00） ---------- */
  var OFFICE_OPEN = 9 * 60;
  var OFFICE_CLOSE = 18 * 60;

  function getOfficeStatus(now) {
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();

    if (day === 0 || day === 6) {
      return { state: "closed", text: "休息日 · 可预约面谈或线上沟通" };
    }
    if (minutes < OFFICE_OPEN) {
      return { state: "closed", text: "未到办公时间 · 今日 09:00 开始" };
    }
    if (minutes < OFFICE_CLOSE) {
      return { state: "open", text: "办公中 · 今日 18:00 下班" };
    }
    return { state: "closed", text: "今日已下班 · 可电话留言预约" };
  }

  var statusTargets = [
    document.getElementById("heroStatus"),
    document.getElementById("openStatus")
  ].filter(Boolean);

  function renderStatus() {
    var status = getOfficeStatus(new Date());
    statusTargets.forEach(function (target) {
      target.setAttribute("data-state", status.state);
      var textNode = target.querySelector(".status-text");
      if (textNode) textNode.textContent = status.text;
    });
  }

  renderStatus();
  window.setInterval(renderStatus, 30000);

  /* ---------- 复制地址 ---------- */
  var copyButton = document.getElementById("copyAddress");
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "readonly");
      helper.style.position = "fixed";
      helper.style.top = "-1000px";
      document.body.appendChild(helper);
      helper.select();
      try {
        var ok = document.execCommand("copy");
        document.body.removeChild(helper);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (err) {
        document.body.removeChild(helper);
        reject(err);
      }
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var address = copyButton.getAttribute("data-address") || "";
      copyText(address).then(
        function () {
          showToast("地址已复制");
        },
        function () {
          showToast("复制失败，请长按地址手动复制");
        }
      );
    });
  }
})();
