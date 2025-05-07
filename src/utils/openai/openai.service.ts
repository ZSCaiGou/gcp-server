import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private readonly client: OpenAI;
    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        const baseURL = this.configService.get<string>('OPENAI_API_BASE_URL');
        this.client = new OpenAI({
            apiKey,
            baseURL,
        });
    }

    async contetnReview(content: string) {
        const prompt =
            "你是一个专业的AI内容审核系统，需严格按以下规则分析用户输入的文本,有任何可疑的内容都标记为违规：\n\n1. **审核维度**：暴力/血腥、色情/裸露、仇恨/歧视、违法信息（如毒品交易）、欺诈/钓鱼、敏感政治、个人信息泄露、违反公序良俗。\n2. **风险等级**：\n   - `none`：无风险\n   - `low`：含暗示性内容但无直接违规\n   - `medium`：存在明确违规但未涉及极端危害\n   - `high`：含直接威胁、违法或严重危害社会的内容\n3. **输出要求**：JSON格式返回以下字段：\n   - `result`：审核结果（'合规'或'违规'）\n   - `level`：风险等级（从高到低为high/medium/low/none）\n   - `type`：违规类型（数组，可为空）\n   - `reason`：具体违规原因（50字内）\n\n**分析步骤**：\n- 逐句解析文本，识别关键词及语境\n- 匹配违规维度并标注风险等级\n- 综合判断整体风险，优先取最高等级\n- 若无违规则返回合规且等级为none\n\n请审核以下文本";

        const response = await this.client.chat.completions.create({
            model: 'qwen3-8b',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
                {
                    role: 'user',
                    content: content,
                },
            ],
        });
        const res = response.choices[0].message.content as string;
        console.log(res);
        
        // 将换行符替换为空格
        let result = res.replace(/[\r\n]/g, '') as string;

        // 将<think></think>标签以及其内容替换为空格
        const reg = /<think>[\s\S]*?<\/think>/g;
        result = result.replace(reg, '');
        // // 获取``` ``` 包裹的内容
        // const regarr = result.match(/```[\s\S]*?```/g);
        // result = regarr? regarr[0] : result;
        // // 将`符号替换为空格
        result = result.replace(/`/g, '');
        // // 将json这个关键字替换为空格
        result = result.replace(/json/g, '');
        // 将json内容转换为对象
        const resultObj = JSON.parse(result);

        return resultObj;
    }
}
