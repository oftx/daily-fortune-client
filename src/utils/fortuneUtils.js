import { FORTUNE_TYPES } from './constants';

/**
 * Implements the two-stage probability model for drawing a fortune,
 * identical to the backend logic.
 * @returns {string} A fortune value (e.g., '大吉').
 */
export const drawFortuneLocally = () => {
  // Destructure for easier access
  const { S_KICHI, DAI_KICHI, KICHI, CHU_KICHI, SHO_KICHI, KYO, DAI_KYO } = FORTUNE_TYPES;

  const goodFortunes = [S_KICHI, DAI_KICHI, KICHI, CHU_KICHI, SHO_KICHI];
  const badFortunes = [KYO, DAI_KYO];

  // First stage: 80% chance for a good fortune pool
  if (Math.random() <= 0.8) {
    // Second stage: Equal chance within the good pool
    const index = Math.floor(Math.random() * goodFortunes.length);
    return goodFortunes[index];
  } else {
    // Second stage: Equal chance within the bad pool
    const index = Math.floor(Math.random() * badFortunes.length);
    return badFortunes[index];
  }
};


/**
 * ===================================================================
 *                         数学辅助函数
 * ===================================================================
 */

// 缓存 logFactorial 的结果以提高性能
const logFactorialCache = [0];

/**
 * 计算 log(n!)，使用缓存避免重复计算。
 * 这是处理大数组合数问题的关键，可以避免数值溢出。
 * @param {number} n 非负整数
 *_ @returns {number} log(n!) 的值
 */
function logFactorial(n) {
    if (n < 0) return NaN;
    if (n < logFactorialCache.length) {
        return logFactorialCache[n];
    }
    for (let i = logFactorialCache.length; i <= n; i++) {
        logFactorialCache[i] = logFactorialCache[i - 1] + Math.log(i);
    }
    return logFactorialCache[n];
}

/**
 * 计算多项分布的对数概率 log(P)。
 * @param {object} counts - 各个子类别的计数的对象，例如 { '大吉': 20, '吉': 15 }
 * @param {number} p_sub - 每个子类别的（在组内的）概率。
 * @returns {number} 该构成的对数概率。
 */
function multinomialLogProbability(counts, p_sub) {
    const k_values = Object.values(counts);
    const n_group = k_values.reduce((sum, val) => sum + val, 0);

    if (n_group === 0) return 0; // 如果组内没有成员，概率为1，对数为0

    let logP = logFactorial(n_group);
    logP -= k_values.reduce((sum, k) => sum + logFactorial(k), 0);
    logP += n_group * Math.log(p_sub); // 因为所有 p_sub 相同，可以简化计算

    return logP;
}


/**
 * ===================================================================
 *                   核心函数：计算增强版稀有度
 * ===================================================================
 */

/**
 * 计算给定复杂抽取结果的增强版稀有度分数。
 * @param {object} counts - 包含所有具体结果计数的对象。
 * @param {number} [logBase=10] - 计算对数时使用的底数，默认为10。
 * @returns {object|null} 包含总分及各部分分数的详细对象, 或在无有效抽卡时返回null。
 */
export function calculateEnhancedRarityScore(counts, logBase = 10) {
    // --- 1. 定义概率配置 ---
    const config = {
        ji_group: {
            outcomes: ['諭吉', '大吉', '吉', '中吉', '小吉'],
            prob: 0.8
        },
        kyo_group: {
            outcomes: ['凶', '大凶'],
            prob: 0.2
        }
    };

    // --- 2. 聚合计数 ---
    const ji_counts = {};
    let k_ji_total = 0;
    config.ji_group.outcomes.forEach(key => {
        const count = counts[key] || 0;
        if (count > 0) ji_counts[key] = count;
        k_ji_total += count;
    });

    const kyo_counts = {};
    let k_kyo_total = 0;
    config.kyo_group.outcomes.forEach(key => {
        const count = counts[key] || 0;
        if (count > 0) kyo_counts[key] = count;
        k_kyo_total += count;
    });

    const n_total = k_ji_total + k_kyo_total;
    if (n_total === 0) return null;


    // --- 3. 计算【分布稀有度分数】 ---
    let distributionTailProb = 0;
    const mean = n_total * config.ji_group.prob;
    
    const combinations = (n, k) => Math.exp(logFactorial(n) - logFactorial(k) - logFactorial(n - k));
    const binomialProbability = (k, n, p) => combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);

    if (k_ji_total <= mean) {
        for (let i = 0; i <= k_ji_total; i++) distributionTailProb += binomialProbability(i, n_total, config.ji_group.prob);
    } else {
        for (let i = k_ji_total; i <= n_total; i++) distributionTailProb += binomialProbability(i, n_total, config.ji_group.prob);
    }
    
    // !!! 修改点：按要求将分数乘以 10
    const distributionScore = (-Math.log(distributionTailProb) / Math.log(logBase)) * 10;

    // --- 4. 计算【构成稀有度分数】 ---
    const p_sub_ji = 1 / config.ji_group.outcomes.length;
    const logP_ji = multinomialLogProbability(ji_counts, p_sub_ji);

    const p_sub_kyo = 1 / config.kyo_group.outcomes.length;
    const logP_kyo = multinomialLogProbability(kyo_counts, p_sub_kyo);

    const totalLogP_composition = logP_ji + logP_kyo;
    // !!! 修改点：按要求将分数乘以 10
    const compositionScore = (-totalLogP_composition / Math.log(logBase)) * 10;

    // --- 5. 计算总分 ---
    const totalScore = distributionScore + compositionScore;

    return {
        totalScore: totalScore,
        distributionScore: distributionScore,
        compositionScore: compositionScore
    };
}
