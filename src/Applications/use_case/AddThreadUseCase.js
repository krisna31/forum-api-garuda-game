const NewThread = require("../../Domains/threads/entities/NewThread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    await this._threadRepository.verifyAvailableThread(newThread.title);
    const addedThread = await this._threadRepository.addThread(newThread);
    return addedThread;
  }
}

module.exports = AddThreadUseCase;
