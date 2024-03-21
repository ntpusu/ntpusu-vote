FROM mcr.microsoft.com/devcontainers/javascript-node

ARG OH_MY_POSH=0
ARG BASHRC_PATH=/etc/bash.bashrc
ARG ZSHRC_PATH=/etc/zsh/zshrc
ARG BASH_COMPLETION_DIR=/usr/share/bash-completion/completions
ARG ZSH_COMPLETION_DIR=/usr/share/zsh/vendor-completions

RUN \
    # Update to latest packages and install fontconfig, bash-completion
    apt update && \
    apt install -y \
    bash-completion && \
    apt dist-upgrade -y && \
    rm -rf /var/lib/apt/lists/* && \
    # Add npm completion
    npm completion >> ${BASH_COMPLETION_DIR}/npm && \
    npm completion >> ${ZSH_COMPLETION_DIR}/_npm && \
    # Install oh-my-posh
    if [ "${OH_MY_POSH}" = "1" ]; then \
    curl -fsSL https://ohmyposh.dev/install.sh | bash && \
    echo 'eval "$(oh-my-posh init bash --config .devcontainer/theme.omp.json)"' >> ${BASHRC_PATH} && \
    echo 'eval "$(oh-my-posh init zsh --config .devcontainer/theme.omp.json)"' >> ${ZSHRC_PATH}; \
    fi
