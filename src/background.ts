chrome.runtime.onInstalled.addListener(function (details) {

    if ( details.reason === "install" || details.reason === "update" ) {  
      chrome.tabs.create({ url: "options.html" });
      // chrome.tabs.create({ url: "tabs/print.html" });
      // chrome.tabs.create({ url: "https://chatgptsave.notion.site/ChatGPT-Bulk-Delete-Home-22510052f0c8806698dfde021315a12f" });
    }
  })
  