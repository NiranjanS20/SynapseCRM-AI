"""Analytics response schemas — real aggregation structures."""
from __future__ import annotations

from pydantic import BaseModel, Field


class StageMetric(BaseModel):
    status: str
    count: int
    total_value: float


class PipelineMetrics(BaseModel):
    total_leads: int = 0
    total_value: float = 0.0
    stages: list[StageMetric] = Field(default_factory=list)


class ConversionMetrics(BaseModel):
    total_new: int = 0
    total_won: int = 0
    total_lost: int = 0
    win_rate: float = 0.0
    avg_deal_value: float = 0.0
    avg_lead_score: float = 0.0


class ActivityMetrics(BaseModel):
    total_activities: int = 0
    by_type: dict[str, int] = Field(default_factory=dict)
    by_day: list[dict] = Field(default_factory=list)


class LeadProgressionMetrics(BaseModel):
    by_source: dict[str, int] = Field(default_factory=dict)
    by_priority: dict[str, int] = Field(default_factory=dict)
    created_over_time: list[dict] = Field(default_factory=list)


class AnalyticsDashboard(BaseModel):
    pipeline: PipelineMetrics = Field(default_factory=PipelineMetrics)
    conversion: ConversionMetrics = Field(default_factory=ConversionMetrics)
    activity: ActivityMetrics = Field(default_factory=ActivityMetrics)
    progression: LeadProgressionMetrics = Field(default_factory=LeadProgressionMetrics)
