FROM mcr.microsoft.com/devcontainers/typescript-node

ARG OH_MY_POSH=0
ARG BASHRC_PATH=/etc/bash.bashrc
ARG ZSHRC_PATH=/etc/zsh/zshrc
ARG BASH_COMPLETION_DIR=/usr/share/bash-completion/completions
ARG ZSH_COMPLETION_DIR=/usr/share/zsh/vendor-completions

RUN \
    # Update to latest packages and install fontconfig, bash-completion
    apt update; \
    apt install -y \
    bash-completion; \
    apt dist-upgrade -y; \
    rm -rf /var/lib/apt/lists/*; \
    # Add hilighting support to zsh
    git clone https://github.com/zdharma-continuum/fast-syntax-highlighting /usr/share/zsh/fast-syntax-highlighting && \
    echo "source /usr/share/zsh/fast-syntax-highlighting/fast-syntax-highlighting.plugin.zsh" >> ${ZSHRC_PATH}; \
    # Add suggestions support to zsh
    git clone https://github.com/zsh-users/zsh-autosuggestions.git /usr/share/zsh/zsh-autosuggestions && \
    echo "source /usr/share/zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ${ZSHRC_PATH}; \
    echo "export ZSH_AUTOSUGGEST_STRATEGY=(history completion)" >> ${ZSHRC_PATH}; \
    # Add oh-my-zsh plugin
    echo "source ~/.oh-my-zsh/plugins/git/git.plugin.zsh" >> ${ZSHRC_PATH}; \
    # Add npm completion
    npm completion >> ${BASH_COMPLETION_DIR}/npm; \
    npm completion >> ${ZSH_COMPLETION_DIR}/_npm; \
    # Install bun
    export BUN_INSTALL=/usr/local && \
    curl -fsSL https://bun.sh/install | bash; \
    # Add bun completion
    bun completions bash > ${BASH_COMPLETION_DIR}/bun; \
    bun completions zsh > ${ZSH_COMPLETION_DIR}/_bun; \
    # Install oh-my-posh
    if [ "${OH_MY_POSH}" = "1" ]; then \
    curl -fsSL https://ohmyposh.dev/install.sh | bash && \
    echo 'eval "$(oh-my-posh init bash --config .devcontainer/theme.omp.json)"' >> ${BASHRC_PATH}; \
    echo 'eval "$(oh-my-posh init zsh --config .devcontainer/theme.omp.json)"' >> ${ZSHRC_PATH}; \
    fi
