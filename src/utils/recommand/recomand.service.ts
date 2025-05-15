import { Injectable } from '@nestjs/common';
import { ContentFearure, UserBehavior } from 'src/tasks/tasks.service';

@Injectable()
export class RecomandService {
    // 构建用户-内容行为矩阵（User-Item Interaction Matrix）
    buildUserItemMatrix(
        behaviors: UserBehavior[],
    ): Map<string, Map<bigint, number>> {
        const matrix = new Map<string, Map<bigint, number>>();
        for (const behavior of behaviors) {
            if (!matrix.has(behavior.user_id)) {
                matrix.set(behavior.user_id, new Map());
            }
            const userBehaviors = matrix.get(behavior.user_id)!;
            // 累计用户对内容的总权重（如多次行为）
            const currentWeight = userBehaviors.get(behavior.item_id) || 0;
            userBehaviors.set(
                behavior.item_id,
                currentWeight + behavior.weight,
            );
        }
        return matrix;
    }

    // 构建内容标签特征（Content Tag Features）
    buildContentTagFeatures(
        contents: ContentFearure[],
    ): Map<bigint, Set<string>> {
        const tagFeatures = new Map<bigint, Set<string>>();
        for (const content of contents) {
            tagFeatures.set(content.item_id, new Set(content.tags));
        }
        return tagFeatures;
    }

    // 计算用户相似度（余弦相似度）
    calculateUserSimilarity(
        user1: Map<bigint, number>,
        user2: Map<bigint, number>,
    ): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        // 遍历用户1的行为
        for (const [itemId, weight] of user1) {
            normA += weight * weight;
            if (user2.has(itemId)) {
                const w2 = user2.get(itemId)!;
                dotProduct += weight * w2;
            }
        }

        // 计算用户2的范数
        for (const weight of user2.values()) {
            normB += weight * weight;
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // 基于协同过滤的推荐
    recommendByCollaborativeFiltering(
        targetUserId: string,
        userBehaviorsMap: Map<string, Map<bigint, number>>,
        contents: ContentFearure[],
        topN: number = 5,
    ): ContentFearure[] {
        // 计算目标用户与其他用户的相似度
        const similarities: { user_id: string; similarity: number }[] = [];
        const targetUserBehaviors = userBehaviorsMap.get(targetUserId);
        if (!targetUserBehaviors) return [];

        for (const [userId, userBehaviors] of userBehaviorsMap) {
            if (userId === targetUserId) continue;
            const similarity = this.calculateUserSimilarity(
                targetUserBehaviors,
                userBehaviors,
            );
            similarities.push({ user_id: userId, similarity });
        }

        // 按相似度排序
        similarities.sort((a, b) => b.similarity - a.similarity);

        // 收集相似用户喜欢的内容
        const recommendedItems = new Map<bigint, number>();
        for (const { user_id, similarity } of similarities) {
            const similarUserBehaviors = userBehaviorsMap.get(user_id)!;
            for (const [itemId, weight] of similarUserBehaviors) {
                // 跳过目标用户已交互的内容
                if (targetUserBehaviors.has(itemId)) continue;
                const score = weight * similarity;
                recommendedItems.set(
                    itemId,
                    (recommendedItems.get(itemId) || 0) + score,
                );
            }
        }

        // 按得分排序并返回内容
        const sortedItems = Array.from(recommendedItems.entries()).sort(
            (a, b) => b[1] - a[1],
        );
        const topItems = sortedItems.slice(0, topN).map(([itemId]) => itemId);

        return contents.filter((content) => topItems.includes(content.item_id));
    }

    // 计算标签相似度（Jaccard相似度）
    calculateTagSimilarity(tags1: Set<string>, tags2: Set<string>): number {
        const intersection = new Set(
            [...tags1].filter((tag) => tags2.has(tag)),
        );
        const union = new Set([...tags1, ...tags2]);
        return intersection.size / union.size;
    }

    // 基于内容的推荐
    recommendByContentBased(
        targetUserId: string,
        userBehaviorsMap: Map<string, Map<bigint, number>>,
        contents: ContentFearure[],
        contentTagFeatures: Map<bigint, Set<string>>,
        topN: number = 5,
    ): ContentFearure[] {
        const targetUserBehaviors = userBehaviorsMap.get(targetUserId);
        if (!targetUserBehaviors) return [];

        // 统计用户偏好标签
        const userTagWeights = new Map<string, number>();
        for (const [itemId, weight] of targetUserBehaviors) {
            const tags = contentTagFeatures.get(itemId);
            if (!tags) continue;
            for (const tag of tags) {
                userTagWeights.set(
                    tag,
                    (userTagWeights.get(tag) || 0) + weight,
                );
            }
        }

        // 计算未交互内容的相似度得分
        const recommendedItems = new Map<bigint, number>();
        for (const content of contents) {
            if (targetUserBehaviors.has(content.item_id)) continue; // 跳过已交互内容
            const contentTags = contentTagFeatures.get(content.item_id);
            if (!contentTags) continue;

            let similarity = 0;
            for (const [tag, weight] of userTagWeights) {
                if (contentTags.has(tag)) {
                    similarity += weight;
                }
            }
            if (similarity > 0) {
                recommendedItems.set(content.item_id, similarity);
            }
        }

        // 按得分排序并返回内容
        const sortedItems = Array.from(recommendedItems.entries()).sort(
            (a, b) => b[1] - a[1],
        );
        const topItems = sortedItems.slice(0, topN).map(([itemId]) => itemId);

        return contents.filter((content) => topItems.includes(content.item_id));
    }

    // 混合推荐（加权平均协同过滤和基于内容的得分）
    hybridRecommendation(
        targetUserId: string,
        userBehaviorsMap: Map<string, Map<bigint, number>>,
        contents: ContentFearure[],
        contentTagFeatures: Map<bigint, Set<string>>,
        collaborativeWeight = 0.6,
        contentWeight = 0.4,
        topN = 5,
    ): ContentFearure[] {
        const collaborativeResults = this.recommendByCollaborativeFiltering(
            targetUserId,
            userBehaviorsMap,
            contents,
            topN,
        );
        const contentBasedResults = this.recommendByContentBased(
            targetUserId,
            userBehaviorsMap,
            contents,
            contentTagFeatures,
            topN,
        );

        // 统计混合得分
        const hybridScores = new Map<bigint, number>();
        for (let i = 0; i < collaborativeResults.length; i++) {
            const content = collaborativeResults[i];
            hybridScores.set(
                content.item_id,
                (hybridScores.get(content.item_id) || 0) +
                    collaborativeWeight * (topN - i),
            );
        }
        for (let i = 0; i < contentBasedResults.length; i++) {
            const content = contentBasedResults[i];
            hybridScores.set(
                content.item_id,
                (hybridScores.get(content.item_id) || 0) +
                    contentWeight * (topN - i),
            );
        }

        // 按混合得分排序
        const sortedItems = Array.from(hybridScores.entries()).sort(
            (a, b) => b[1] - a[1],
        );
        const topItems = sortedItems.slice(0, topN).map(([itemId]) => itemId);

        return contents.filter((content) => topItems.includes(content.item_id));
    }
}
