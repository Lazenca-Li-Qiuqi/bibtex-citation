const { I18n } = window[Symbol.for("typora-plugin-core@v2")];

export const i18n = new I18n({
  resources: {
    en: {
      commandInsert: "Insert BibTeX Citation",
      fileNotFound: "BibTeX file not found: ",
      noFilesConfigured: "Please configure at least one BibTeX file path.",
      loadError: "Failed to load BibTeX files: ",
      settingsSaved: "Settings updated.",
      emptyPathWarning: "Please enter a BibTeX file path first.",
      absolutePathRequired:
        "This path mode only accepts absolute BibTeX file paths.",
      settings: {
        pathBase: {
          name: "Path Base",
          desc: "Choose how non-absolute BibTeX file paths should be resolved.",
          markdown: "Relative to the current Markdown file",
          typora: "Relative to the folder currently opened in Typora",
          absolute: "Absolute paths only",
        },
        bibFiles: {
          name: "BibTeX Files",
          desc: "Manage BibTeX file paths one by one. The order controls duplicate citation key priority.",
          add: "Add BibTeX File",
          empty: "No BibTeX files configured yet.",
          placeholder: "./references.bib",
          remove: "Remove",
        },
      },
    },
  },
});
