FROM mcr.microsoft.com/devcontainers/javascript-node

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
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git /usr/share/zsh/zsh-syntax-highlighting && \
    echo "source /usr/share/zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ${ZSHRC_PATH}; \
    # Add suggestions support to zsh
    git clone https://github.com/zsh-users/zsh-autosuggestions.git /usr/share/zsh/zsh-autosuggestions && \
    echo "source /usr/share/zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ${ZSHRC_PATH}; \
    echo "export ZSH_AUTOSUGGEST_STRATEGY=(history completion)" >> ${ZSHRC_PATH}; \
    # Add web search plugin
    echo "source ~/.oh-my-zsh/plugins/web-search/web-search.plugin.zsh" >> ${ZSHRC_PATH}; \
    # Add npm completion
    npm completion >> ${BASH_COMPLETION_DIR}/npm; \
    npm completion >> ${ZSH_COMPLETION_DIR}/_npm; \
    # Install oh-my-posh
    if [ "${OH_MY_POSH}" = "1" ]; then \
    curl -fsSL https://ohmyposh.dev/install.sh | bash && \
    echo 'eval "$(oh-my-posh init bash --config .devcontainer/theme.omp.json)"' >> ${BASHRC_PATH}; \
    echo 'eval "$(oh-my-posh init zsh --config .devcontainer/theme.omp.json)"' >> ${ZSHRC_PATH}; \
    fi
