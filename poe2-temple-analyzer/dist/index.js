"use strict";
/**
 * PoE2 Temple Analyzer MCP Server
 *
 * A Model Context Protocol server for analyzing Path of Exile 2 Vaal Temple layouts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUCache = exports.validateShareURL = exports.extractShareData = exports.generateSuggestions = exports.calculateDensityScore = exports.calculateRoomValue = exports.calculateStarRating = exports.calculateOverallScore = exports.clearAnalysisCache = exports.countRoomsByTier = exports.filterRewardRooms = exports.analyzeTemple = exports.parseTempleArray = exports.decodeTempleData = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
// Import all modules
// Types are re-exported from modules
// Core functionality
var decoder_1 = require("./core/decoder");
Object.defineProperty(exports, "decodeTempleData", { enumerable: true, get: function () { return decoder_1.decodeTempleData; } });
Object.defineProperty(exports, "parseTempleArray", { enumerable: true, get: function () { return decoder_1.parseTempleArray; } });
var analyzer_1 = require("./core/analyzer");
Object.defineProperty(exports, "analyzeTemple", { enumerable: true, get: function () { return analyzer_1.analyzeTemple; } });
Object.defineProperty(exports, "filterRewardRooms", { enumerable: true, get: function () { return analyzer_1.filterRewardRooms; } });
Object.defineProperty(exports, "countRoomsByTier", { enumerable: true, get: function () { return analyzer_1.countRoomsByTier; } });
Object.defineProperty(exports, "clearAnalysisCache", { enumerable: true, get: function () { return analyzer_1.clearAnalysisCache; } });
var scorer_1 = require("./core/scorer");
Object.defineProperty(exports, "calculateOverallScore", { enumerable: true, get: function () { return scorer_1.calculateOverallScore; } });
Object.defineProperty(exports, "calculateStarRating", { enumerable: true, get: function () { return scorer_1.calculateStarRating; } });
Object.defineProperty(exports, "calculateRoomValue", { enumerable: true, get: function () { return scorer_1.calculateRoomValue; } });
Object.defineProperty(exports, "calculateDensityScore", { enumerable: true, get: function () { return scorer_1.calculateDensityScore; } });
Object.defineProperty(exports, "generateSuggestions", { enumerable: true, get: function () { return scorer_1.generateSuggestions; } });
// Utilities
var url_parser_1 = require("./utils/url-parser");
Object.defineProperty(exports, "extractShareData", { enumerable: true, get: function () { return url_parser_1.extractShareData; } });
Object.defineProperty(exports, "validateShareURL", { enumerable: true, get: function () { return url_parser_1.validateShareURL; } });
var cache_1 = require("./utils/cache");
Object.defineProperty(exports, "LRUCache", { enumerable: true, get: function () { return cache_1.LRUCache; } });
// Configuration
__exportStar(require("./config/room-types"), exports);
__exportStar(require("./config/scoring-config"), exports);
// Tools
const analyze_temple_url_1 = require("./tools/analyze-temple-url");
const analyze_temple_data_1 = require("./tools/analyze-temple-data");
const get_room_info_1 = require("./tools/get-room-info");
const get_rating_criteria_1 = require("./tools/get-rating-criteria");
/**
 * Create MCP Server
 */
const server = new index_js_1.Server({
    name: 'poe2-temple-analyzer',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * List available tools
 */
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: analyze_temple_url_1.name,
                description: 'Analyze a PoE2 Vaal Temple layout from a share URL and calculate star rating',
                inputSchema: analyze_temple_url_1.inputSchema,
            },
            {
                name: analyze_temple_data_1.name,
                description: 'Analyze temple data directly from decoded JSON structure',
                inputSchema: analyze_temple_data_1.inputSchema,
            },
            {
                name: get_room_info_1.name,
                description: 'Get information about a specific room type in PoE2 Vaal Temple',
                inputSchema: get_room_info_1.inputSchema,
            },
            {
                name: get_rating_criteria_1.name,
                description: 'Get the criteria and formulas used for calculating star ratings',
                inputSchema: get_rating_criteria_1.inputSchema,
            },
        ],
    };
});
/**
 * Handle tool calls
 */
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case analyze_temple_url_1.name:
                return await (0, analyze_temple_url_1.handler)(args);
            case analyze_temple_data_1.name:
                return await (0, analyze_temple_data_1.handler)(args);
            case get_room_info_1.name:
                return await (0, get_room_info_1.handler)(args);
            case get_rating_criteria_1.name:
                return await (0, get_rating_criteria_1.handler)();
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
/**
 * Start server
 */
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('PoE2 Temple Analyzer MCP Server started');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map