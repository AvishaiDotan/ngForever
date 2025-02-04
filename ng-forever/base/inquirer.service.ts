import inquirer from 'inquirer';

class InquiryService {
  private static instance: InquiryService;

  private constructor() {}

  public static getInstance(): InquiryService {
    if (!InquiryService.instance) {
      InquiryService.instance = new InquiryService();
    }
    return InquiryService.instance;
  }

  async query(questions: Parameters<typeof inquirer.prompt>[0]) {
    return await inquirer.prompt(questions);
  }
}

const service = InquiryService.getInstance();

export { service as InquiryService };