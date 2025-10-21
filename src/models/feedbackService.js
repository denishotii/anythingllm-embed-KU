/**
 * FeedbackService
 * Handles communication with the StudiBot Feedback API
 */

const FeedbackService = {
  // API base URL - configure based on environment
  baseUrl: import.meta.env?.VITE_FEEDBACK_API_URL || "http://localhost:8001/api/v1",

  /**
   * Submit user feedback to the API
   * @param {Object} feedbackData - Feedback data object
   * @param {string} feedbackData.session_id - Session ID from AnythingLLM
   * @param {number} feedbackData.rating - Rating from 1-5
   * @param {string} feedbackData.goal_achieved - YES, NO, or PARTIALLY
   * @param {string} feedbackData.comment - Optional comment
   * @param {string} feedbackData.feedback_triggered_by - AUTO_PROMPT or USER_INITIATED
   * @param {string} feedbackData.user_agent - Browser user agent
   * @returns {Promise} - API response
   */
  async submitFeedback(feedbackData) {
    try {
      console.log("📤 Submitting feedback:", feedbackData);

      const response = await fetch(`${this.baseUrl}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ Feedback submitted successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      throw error;
    }
  },

  /**
   * Log when a feedback prompt is shown/interacted with
   * @param {string} sessionId - Session ID
   * @param {string} promptType - INACTIVITY, POST_ANSWER, or SESSION_END
   * @param {boolean} wasResponded - Whether user responded or skipped
   * @returns {Promise} - API response
   */
  async logPromptShown(sessionId, promptType = "POST_ANSWER", wasResponded = false) {
    try {
      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          prompt_type: promptType,
          was_responded: wasResponded,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error logging prompt:", error);
      // Don't throw - logging failures shouldn't break UX
      return null;
    }
  },

  /**
   * Update session analytics
   * @param {Object} sessionData - Session data
   * @returns {Promise} - API response
   */
  async updateSession(sessionData) {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error updating session:", error);
      // Don't throw - session updates shouldn't break UX
      return null;
    }
  },

  /**
   * Check if API is healthy
   * @returns {Promise<boolean>} - true if API is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
      const data = await response.json();
      return data.status === "healthy";
    } catch (error) {
      console.error("❌ API health check failed:", error);
      return false;
    }
  },
};

export default FeedbackService;

