// Copyright 2020 Goldman Sachs
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package org.finos.legend.engine.language.pure.compiler.toPureGraph.handlers;

import org.eclipse.collections.impl.utility.ListIterate;
import org.finos.legend.engine.language.pure.compiler.toPureGraph.HelperMappingBuilder;
import org.finos.legend.pure.generated.Root_meta_core_runtime_EngineRuntime;
import org.finos.legend.pure.generated.Root_meta_pure_runtime_PackageableRuntime;
import org.finos.legend.pure.m3.coreinstance.meta.pure.mapping.Mapping;

import java.util.HashSet;
import java.util.Set;

public class DefaultRuntimeCompilerHandler implements RuntimeCompilerHandler
{
    @Override
    public boolean isRuntimeCompatibleWithMapping(Root_meta_pure_runtime_PackageableRuntime runtime, Mapping mappingToCheck)
    {
        return isRuntimeCompatibleWithMapping(runtime._runtimeValue(), mappingToCheck);
    }

    public static boolean isRuntimeCompatibleWithMapping(Root_meta_core_runtime_EngineRuntime runtime, Mapping mappingToCheck)
    {
        return ListIterate.collect(runtime._mappings().toList(), mapping ->
        {
            Set<Mapping> mappings = new HashSet<>();
            mappings.add(mapping);
            mappings.addAll(HelperMappingBuilder.getAllIncludedMappings(mapping).toSet());
            return mappings;
        }).anySatisfy(mappings -> mappings.contains(mappingToCheck));
    }
}
