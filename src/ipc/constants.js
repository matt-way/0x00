const ipcConstants = {
  program: {
    create: 'ipc-program-create',
    open: 'ipc-program-open',
  },
  blocks: {
    create: 'ipc-block-create',
    createFromExisting: 'ipc-block-create-from-existing',
    download: 'ipc-block-download',
    remove: 'ipc-block-remove',
    updateInfo: 'ipc-block-update-info',
    installDependency: 'ipc-block-install-dependency',
    uninstallDependency: 'ipc-block-uninstall-dependency',
    saveState: 'ipc-block-save-state',
    loadState: 'ipc-block-load-state',
  },
  properties: {
    selectFile: 'ipc-property-select-file',
  },
  engine: {
    setBounds: 'ipc-engine-set-bounds',
    transpileBlock: 'ipc-engine-transpile-block',
  },
}

export default ipcConstants
